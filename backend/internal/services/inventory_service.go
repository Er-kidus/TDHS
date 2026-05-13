package services

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
)

type InventoryService struct {
	db *sql.DB
}

func NewInventoryService(db *sql.DB) *InventoryService {
	return &InventoryService{db: db}
}

func (s *InventoryService) CreateInventoryItem(inventory *models.Inventory) error {
	query := `
		INSERT INTO inventory (id, pharmacy_id, medication_id, quantity_on_hand, reorder_level, unit_cost, selling_price, expiry_date, batch_number, supplier, last_updated)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	inventory.ID = uuid.New()
	inventory.LastUpdated = time.Now()

	_, err := s.db.Exec(query,
		inventory.ID, inventory.PharmacyID, inventory.MedicationID, inventory.QuantityOnHand,
		inventory.ReorderLevel, inventory.UnitCost, inventory.SellingPrice, inventory.ExpiryDate,
		inventory.BatchNumber, inventory.Supplier, inventory.LastUpdated,
	)

	return err
}

func (s *InventoryService) GetInventoryItem(id uuid.UUID) (*models.Inventory, error) {
	query := `
		SELECT id, pharmacy_id, medication_id, quantity_on_hand, reorder_level, unit_cost, selling_price, expiry_date, batch_number, supplier, last_updated
		FROM inventory WHERE id = $1
	`

	inventory := &models.Inventory{}
	err := s.db.QueryRow(query, id).Scan(
		&inventory.ID, &inventory.PharmacyID, &inventory.MedicationID, &inventory.QuantityOnHand,
		&inventory.ReorderLevel, &inventory.UnitCost, &inventory.SellingPrice, &inventory.ExpiryDate,
		&inventory.BatchNumber, &inventory.Supplier, &inventory.LastUpdated,
	)

	if err != nil {
		return nil, err
	}

	return inventory, nil
}

func (s *InventoryService) GetInventory(pharmacyID uuid.UUID) ([]*models.InventoryWithMedication, error) {
	query := `
		SELECT 
			i.id, i.pharmacy_id, i.medication_id, i.quantity_on_hand, i.reorder_level, 
			i.unit_cost, i.selling_price, i.expiry_date, i.batch_number, i.supplier, i.last_updated,
			COALESCE(m.brand_name, m.generic_name, '') as medication_name,
			m.manufacturer,
			m.ndc_code as ndc,
			NULL as category,  -- This would come from a category table if available
			NULL as max_stock, -- This could be calculated or stored separately
			i.selling_price as unit_price
		FROM inventory i
		LEFT JOIN medications m ON i.medication_id = m.id
		WHERE i.pharmacy_id = $1 
		ORDER BY i.last_updated DESC
	`

	rows, err := s.db.Query(query, pharmacyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var inventory []*models.InventoryWithMedication
	for rows.Next() {
		item := &models.InventoryWithMedication{}
		err := rows.Scan(
			&item.ID, &item.PharmacyID, &item.MedicationID, &item.QuantityOnHand,
			&item.ReorderLevel, &item.UnitCost, &item.SellingPrice, &item.ExpiryDate,
			&item.BatchNumber, &item.Supplier, &item.LastUpdated,
			&item.MedicationName, &item.Manufacturer, &item.NDC, &item.Category,
			&item.MaxStock, &item.UnitPrice,
		)
		if err != nil {
			return nil, err
		}
		inventory = append(inventory, item)
	}

	return inventory, nil
}

func (s *InventoryService) UpdateInventoryItem(inventory *models.Inventory) error {
	query := `
		UPDATE inventory 
		SET quantity_on_hand = $2, reorder_level = $3, unit_cost = $4, selling_price = $5, expiry_date = $6, batch_number = $7, supplier = $8, last_updated = $9
		WHERE id = $1
	`

	inventory.LastUpdated = time.Now()

	_, err := s.db.Exec(query,
		inventory.ID, inventory.QuantityOnHand, inventory.ReorderLevel, inventory.UnitCost,
		inventory.SellingPrice, inventory.ExpiryDate, inventory.BatchNumber, inventory.Supplier, inventory.LastUpdated,
	)

	return err
}

func (s *InventoryService) DeleteInventoryItem(id uuid.UUID) error {
	query := `DELETE FROM inventory WHERE id = $1`

	_, err := s.db.Exec(query, id)
	return err
}

func (s *InventoryService) GetLowStockItems(pharmacyID uuid.UUID) ([]*models.Inventory, error) {
	query := `
		SELECT id, pharmacy_id, medication_id, quantity_on_hand, reorder_level, unit_cost, selling_price, expiry_date, batch_number, supplier, last_updated
		FROM inventory 
		WHERE pharmacy_id = $1 AND quantity_on_hand <= reorder_level 
		ORDER BY quantity_on_hand ASC
	`

	rows, err := s.db.Query(query, pharmacyID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.Inventory
	for rows.Next() {
		item := &models.Inventory{}
		err := rows.Scan(
			&item.ID, &item.PharmacyID, &item.MedicationID, &item.QuantityOnHand,
			&item.ReorderLevel, &item.UnitCost, &item.SellingPrice, &item.ExpiryDate,
			&item.BatchNumber, &item.Supplier, &item.LastUpdated,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

func (s *InventoryService) RestockItem(id uuid.UUID, quantity int) error {
	query := `
		UPDATE inventory 
		SET quantity_on_hand = quantity_on_hand + $2, last_updated = $3
		WHERE id = $1
	`

	_, err := s.db.Exec(query, id, quantity, time.Now())
	return err
}

func (s *InventoryService) UpdateStockQuantity(id uuid.UUID, quantity int) error {
	query := `
		UPDATE inventory 
		SET quantity_on_hand = $2, last_updated = $3
		WHERE id = $1
	`

	_, err := s.db.Exec(query, id, quantity, time.Now())
	return err
}

func (s *InventoryService) GetExpiringItems(pharmacyID uuid.UUID, days int) ([]*models.Inventory, error) {
	query := `
		SELECT id, pharmacy_id, medication_id, quantity_on_hand, reorder_level, unit_cost, selling_price, expiry_date, batch_number, supplier, last_updated
		FROM inventory 
		WHERE pharmacy_id = $1 AND expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '%d days'
		ORDER BY expiry_date ASC
	`

	rows, err := s.db.Query(query, pharmacyID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.Inventory
	for rows.Next() {
		item := &models.Inventory{}
		err := rows.Scan(
			&item.ID, &item.PharmacyID, &item.MedicationID, &item.QuantityOnHand,
			&item.ReorderLevel, &item.UnitCost, &item.SellingPrice, &item.ExpiryDate,
			&item.BatchNumber, &item.Supplier, &item.LastUpdated,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

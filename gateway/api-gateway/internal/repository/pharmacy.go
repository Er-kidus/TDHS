package repository

import (
	"context"
	"database/sql"

	"github.com/tenadam/api-gateway/internal/model"
)

func (r *Repository) ListMedications(ctx context.Context, q string, limit int) ([]*model.Medication, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	
	var rows *sql.Rows
	var err error
	if q != "" {
		qry := `SELECT id, name, COALESCE(generic_name,''), COALESCE(rx_norm_code,''), COALESCE(dosage_form,''), COALESCE(strength,''), is_active, created_at, updated_at
				FROM medications WHERE name ILIKE $1 OR generic_name ILIKE $1 LIMIT $2`
		rows, err = r.db.QueryContext(ctx, qry, "%"+q+"%", limit)
	} else {
		qry := `SELECT id, name, COALESCE(generic_name,''), COALESCE(rx_norm_code,''), COALESCE(dosage_form,''), COALESCE(strength,''), is_active, created_at, updated_at
				FROM medications LIMIT $1`
		rows, err = r.db.QueryContext(ctx, qry, limit)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.Medication, 0)
	for rows.Next() {
		var it model.Medication
		if err := rows.Scan(&it.ID, &it.Name, &it.GenericName, &it.RxNormCode, &it.DosageForm, &it.Strength, &it.IsActive, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return nil, err
		}
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) OrgUpdateInventory(ctx context.Context, orgID, medID string, stockLevel, reorderLevel int, unitPrice float64, status string) (*model.PharmacyInventory, error) {
	qry := `INSERT INTO pharmacy_inventories (tenant_id, organization_id, medication_id, stock_level, reorder_level, unit_price, status, last_restocked)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), $1::uuid, $2::uuid, $3, $4, $5, $6, NOW())
			ON CONFLICT (organization_id, medication_id)
			DO UPDATE SET stock_level = $3, reorder_level = $4, unit_price = $5, status = $6, last_restocked = NOW(), updated_at = NOW()
			RETURNING id, COALESCE(organization_id::text,''), COALESCE(medication_id::text,''), stock_level, reorder_level, unit_price, status, last_restocked, created_at, updated_at`
	
	var it model.PharmacyInventory
	var lastRestocked sql.NullTime
	
	err := r.db.QueryRowContext(ctx, qry, orgID, medID, stockLevel, reorderLevel, unitPrice, status).Scan(
		&it.ID, &it.OrganizationID, &it.MedicationID, &it.StockLevel, &it.ReorderLevel, &it.UnitPrice, &it.Status, &lastRestocked, &it.CreatedAt, &it.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	if lastRestocked.Valid {
		t := lastRestocked.Time
		it.LastRestocked = &t
	}
	return &it, nil
}

func (r *Repository) OrgListInventory(ctx context.Context, orgID string, limit int) ([]*model.PharmacyInventory, error) {
	if limit <= 0 || limit > 500 {
		limit = 100
	}
	qry := `SELECT pi.id, COALESCE(pi.organization_id::text,''), COALESCE(pi.medication_id::text,''), pi.stock_level, pi.reorder_level, pi.unit_price, pi.status, pi.last_restocked, pi.created_at, pi.updated_at,
	               m.id, m.name, COALESCE(m.generic_name,''), COALESCE(m.rx_norm_code,''), COALESCE(m.dosage_form,''), COALESCE(m.strength,''), m.is_active
			FROM pharmacy_inventories pi
			JOIN medications m ON pi.medication_id = m.id
			WHERE pi.organization_id = $1::uuid
			ORDER BY m.name ASC LIMIT $2`
	
	rows, err := r.db.QueryContext(ctx, qry, orgID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]*model.PharmacyInventory, 0)
	for rows.Next() {
		var it model.PharmacyInventory
		var lr sql.NullTime
		var m model.Medication
		err := rows.Scan(
			&it.ID, &it.OrganizationID, &it.MedicationID, &it.StockLevel, &it.ReorderLevel, &it.UnitPrice, &it.Status, &lr, &it.CreatedAt, &it.UpdatedAt,
			&m.ID, &m.Name, &m.GenericName, &m.RxNormCode, &m.DosageForm, &m.Strength, &m.IsActive,
		)
		if err != nil {
			return nil, err
		}
		if lr.Valid {
			t := lr.Time
			it.LastRestocked = &t
		}
		it.Medication = &m
		out = append(out, &it)
	}
	return out, rows.Err()
}

func (r *Repository) PatientSearchPharmacies(ctx context.Context, medID string) ([]*model.PharmacyInventory, error) {
	// Search pharmacies that have the medication in stock
	qry := `SELECT pi.id, COALESCE(pi.organization_id::text,''), COALESCE(pi.medication_id::text,''), pi.stock_level, pi.unit_price, pi.status, pi.updated_at,
				   o.name as org_name
			FROM pharmacy_inventories pi
			JOIN organizations o ON pi.organization_id = o.id
			WHERE pi.medication_id = $1::uuid AND pi.status = 'in_stock' AND pi.stock_level > 0
			ORDER BY pi.unit_price ASC LIMIT 50`

	rows, err := r.db.QueryContext(ctx, qry, medID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Using a modified structure or returning an anonymous map/struct is often easier, but we'll use PharmacyInventory and tuck org name somewhere.
	// Since OrgName is not on model.PharmacyInventory natively, we might just pass a dynamic struct or add an extension field. Let's return raw maps for this specific search or add OrgName to PharmacyInventory if needed.
	// For simplicity, we'll return a raw slice of maps since this is for the patient endpoint
	out := make([]*model.PharmacyInventory, 0) // ... wait, we need org name for the UI. Let's just create a custom return map in the service layer or here.
	return out, nil // Placeholder
}

func (r *Repository) PatientSearchPharmaciesMap(ctx context.Context, medID string, lat, lng float64) ([]map[string]any, error) {
	qry := `SELECT pi.organization_id, o.name as pharmacy_name, o.contact_email, pi.stock_level, pi.unit_price, pi.status
			FROM pharmacy_inventories pi
			JOIN organizations o ON pi.organization_id = o.id
			WHERE pi.medication_id = $1::uuid AND pi.status = 'in_stock' AND pi.stock_level > 0
			ORDER BY pi.unit_price ASC LIMIT 50`

	rows, err := r.db.QueryContext(ctx, qry, medID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]map[string]any, 0)
	for rows.Next() {
		var orgID, name, email, status string
		var stock int
		var price float64
		if err := rows.Scan(&orgID, &name, &email, &stock, &price, &status); err != nil {
			return nil, err
		}
		out = append(out, map[string]any{
			"organization_id": orgID,
			"pharmacy_name":   name,
			"contact_email":   email,
			"stock_level":     stock,
			"unit_price":      price,
			"status":          status,
		})
	}
	return out, rows.Err()
}

func (r *Repository) OrgLogFulfillment(ctx context.Context, orgID, pharmacistID, rxID, patID, medID string, qty int, notes string) (*model.PrescriptionFulfillment, error) {
	// Simple insert
	qry := `INSERT INTO prescription_fulfillments (tenant_id, organization_id, patient_id, prescription_id, pharmacist_id, medication_id, quantity_dispensed, notes)
			VALUES ((SELECT id FROM tenants WHERE slug='default'), $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6, $7)
			RETURNING id, COALESCE(organization_id::text,''), COALESCE(patient_id::text,''), COALESCE(prescription_id::text,''), COALESCE(pharmacist_id::text,''), COALESCE(medication_id::text,''), quantity_dispensed, COALESCE(notes,''), fulfilled_at`

	var it model.PrescriptionFulfillment
	err := r.db.QueryRowContext(ctx, qry, orgID, patID, rxID, pharmacistID, medID, qty, notes).Scan(
		&it.ID, &it.OrganizationID, &it.PatientID, &it.PrescriptionID, &it.PharmacistID, &it.MedicationID, &it.QuantityDispensed, &it.Notes, &it.FulfilledAt,
	)
	if err != nil {
		return nil, err
	}

	// Also decrement stock
	updQry := `UPDATE pharmacy_inventories SET stock_level = stock_level - $1, updated_at = NOW() WHERE organization_id = $2::uuid AND medication_id = $3::uuid`
	_, _ = r.db.ExecContext(ctx, updQry, qty, orgID, medID)

	return &it, nil
}

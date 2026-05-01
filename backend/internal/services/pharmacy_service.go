package services

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
)

type PharmacyService struct {
	db *sql.DB
}

func NewPharmacyService(db *sql.DB) *PharmacyService {
	return &PharmacyService{db: db}
}

func (s *PharmacyService) CreatePharmacy(pharmacy *models.Pharmacy) error {
	query := `
		INSERT INTO pharmacies (id, name, license_number, address, phone, email, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`

	pharmacy.ID = uuid.New()
	pharmacy.IsActive = true
	pharmacy.CreatedAt = time.Now()

	_, err := s.db.Exec(query,
		pharmacy.ID, pharmacy.Name, pharmacy.LicenseNumber, pharmacy.Address,
		pharmacy.Phone, pharmacy.Email, pharmacy.IsActive, pharmacy.CreatedAt,
	)

	return err
}

func (s *PharmacyService) GetPharmacyByID(id uuid.UUID) (*models.Pharmacy, error) {
	query := `
		SELECT id, name, license_number, address, phone, email, is_active, created_at
		FROM pharmacies WHERE id = $1
	`

	pharmacy := &models.Pharmacy{}
	err := s.db.QueryRow(query, id).Scan(
		&pharmacy.ID, &pharmacy.Name, &pharmacy.LicenseNumber, &pharmacy.Address,
		&pharmacy.Phone, &pharmacy.Email, &pharmacy.IsActive, &pharmacy.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return pharmacy, nil
}

func (s *PharmacyService) GetPharmacies() ([]*models.Pharmacy, error) {
	query := `
		SELECT id, name, license_number, address, phone, email, is_active, created_at
		FROM pharmacies WHERE is_active = true ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var pharmacies []*models.Pharmacy
	for rows.Next() {
		pharmacy := &models.Pharmacy{}
		err := rows.Scan(
			&pharmacy.ID, &pharmacy.Name, &pharmacy.LicenseNumber, &pharmacy.Address,
			&pharmacy.Phone, &pharmacy.Email, &pharmacy.IsActive, &pharmacy.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		pharmacies = append(pharmacies, pharmacy)
	}

	return pharmacies, nil
}

func (s *PharmacyService) UpdatePharmacy(pharmacy *models.Pharmacy) error {
	query := `
		UPDATE pharmacies 
		SET name = $2, license_number = $3, address = $4, phone = $5, email = $6
		WHERE id = $1
	`

	_, err := s.db.Exec(query,
		pharmacy.ID, pharmacy.Name, pharmacy.LicenseNumber, pharmacy.Address,
		pharmacy.Phone, pharmacy.Email,
	)

	return err
}

func (s *PharmacyService) DeletePharmacy(id uuid.UUID) error {
	query := `UPDATE pharmacies SET is_active = false WHERE id = $1`

	_, err := s.db.Exec(query, id)
	return err
}

package services

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
)

type MedicationService struct {
	db *sql.DB
}

func NewMedicationService(db *sql.DB) *MedicationService {
	return &MedicationService{db: db}
}

func (s *MedicationService) CreateMedication(medication *models.Medication) error {
	query := `
		INSERT INTO medications (id, ndc_code, brand_name, generic_name, dosage_form, strength, manufacturer, description, is_controlled_substance, schedule_level, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	medication.ID = uuid.New()
	medication.CreatedAt = time.Now()

	_, err := s.db.Exec(query,
		medication.ID, medication.NDCCode, medication.BrandName, medication.GenericName,
		medication.DosageForm, medication.Strength, medication.Manufacturer, medication.Description,
		medication.IsControlledSubstance, medication.ScheduleLevel, medication.CreatedAt,
	)

	return err
}

func (s *MedicationService) GetMedicationByID(id uuid.UUID) (*models.Medication, error) {
	query := `
		SELECT id, ndc_code, brand_name, generic_name, dosage_form, strength, manufacturer, description, is_controlled_substance, schedule_level, created_at
		FROM medications WHERE id = $1
	`

	medication := &models.Medication{}
	err := s.db.QueryRow(query, id).Scan(
		&medication.ID, &medication.NDCCode, &medication.BrandName, &medication.GenericName,
		&medication.DosageForm, &medication.Strength, &medication.Manufacturer, &medication.Description,
		&medication.IsControlledSubstance, &medication.ScheduleLevel, &medication.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return medication, nil
}

func (s *MedicationService) GetMedications() ([]*models.Medication, error) {
	query := `
		SELECT id, ndc_code, brand_name, generic_name, dosage_form, strength, manufacturer, description, is_controlled_substance, schedule_level, created_at
		FROM medications ORDER BY brand_name ASC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var medications []*models.Medication
	for rows.Next() {
		medication := &models.Medication{}
		err := rows.Scan(
			&medication.ID, &medication.NDCCode, &medication.BrandName, &medication.GenericName,
			&medication.DosageForm, &medication.Strength, &medication.Manufacturer, &medication.Description,
			&medication.IsControlledSubstance, &medication.ScheduleLevel, &medication.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		medications = append(medications, medication)
	}

	return medications, nil
}

func (s *MedicationService) UpdateMedication(medication *models.Medication) error {
	query := `
		UPDATE medications 
		SET ndc_code = $2, brand_name = $3, generic_name = $4, dosage_form = $5, strength = $6, manufacturer = $7, description = $8, is_controlled_substance = $9, schedule_level = $10
		WHERE id = $1
	`

	_, err := s.db.Exec(query,
		medication.ID, medication.NDCCode, medication.BrandName, medication.GenericName,
		medication.DosageForm, medication.Strength, medication.Manufacturer, medication.Description,
		medication.IsControlledSubstance, medication.ScheduleLevel,
	)

	return err
}

func (s *MedicationService) DeleteMedication(id uuid.UUID) error {
	query := `DELETE FROM medications WHERE id = $1`

	_, err := s.db.Exec(query, id)
	return err
}

func (s *MedicationService) SearchMedications(searchTerm string) ([]*models.Medication, error) {
	query := `
		SELECT id, ndc_code, brand_name, generic_name, dosage_form, strength, manufacturer, description, is_controlled_substance, schedule_level, created_at
		FROM medications 
		WHERE brand_name ILIKE '%' || $1 || '%' OR generic_name ILIKE '%' || $1 || '%' OR ndc_code ILIKE '%' || $1 || '%'
		ORDER BY brand_name ASC
	`

	rows, err := s.db.Query(query, searchTerm)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var medications []*models.Medication
	for rows.Next() {
		medication := &models.Medication{}
		err := rows.Scan(
			&medication.ID, &medication.NDCCode, &medication.BrandName, &medication.GenericName,
			&medication.DosageForm, &medication.Strength, &medication.Manufacturer, &medication.Description,
			&medication.IsControlledSubstance, &medication.ScheduleLevel, &medication.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		medications = append(medications, medication)
	}

	return medications, nil
}

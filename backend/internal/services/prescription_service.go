package services

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"pharmacy-backend/internal/models"
)

type PrescriptionService struct {
	db *sql.DB
}

func NewPrescriptionService(db *sql.DB) *PrescriptionService {
	return &PrescriptionService{db: db}
}

func (s *PrescriptionService) CreatePrescription(prescription *models.Prescription) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Generate prescription number
	prescriptionNumber := fmt.Sprintf("RX%d", time.Now().Unix())

	// Insert prescription
	prescriptionQuery := `
		INSERT INTO prescriptions (id, prescription_number, patient_id, doctor_id, pharmacy_id, date_prescribed, status, notes, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`

	prescription.ID = uuid.New()
	prescription.PrescriptionNumber = prescriptionNumber
	prescription.Status = models.StatusPending
	prescription.CreatedAt = time.Now()

	err = tx.QueryRow(prescriptionQuery,
		prescription.ID, prescription.PrescriptionNumber, prescription.PatientID,
		prescription.DoctorID, prescription.PharmacyID, prescription.DatePrescribed,
		prescription.Status, prescription.Notes, prescription.CreatedAt,
	).Scan(&prescription.ID)

	if err != nil {
		return err
	}

	return tx.Commit()
}

func (s *PrescriptionService) GetPrescriptionByID(id uuid.UUID) (*models.Prescription, error) {
	query := `
		SELECT id, prescription_number, patient_id, doctor_id, pharmacy_id, date_prescribed, date_filled, status, notes, created_at
		FROM prescriptions WHERE id = $1
	`

	prescription := &models.Prescription{}
	err := s.db.QueryRow(query, id).Scan(
		&prescription.ID, &prescription.PrescriptionNumber, &prescription.PatientID,
		&prescription.DoctorID, &prescription.PharmacyID, &prescription.DatePrescribed,
		&prescription.DateFilled, &prescription.Status, &prescription.Notes, &prescription.CreatedAt,
	)

	if err != nil {
		return nil, err
	}

	return prescription, nil
}

func (s *PrescriptionService) GetPrescriptions() ([]*models.Prescription, error) {
	query := `
		SELECT id, prescription_number, patient_id, doctor_id, pharmacy_id, date_prescribed, date_filled, status, notes, created_at
		FROM prescriptions ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prescriptions []*models.Prescription
	for rows.Next() {
		prescription := &models.Prescription{}
		err := rows.Scan(
			&prescription.ID, &prescription.PrescriptionNumber, &prescription.PatientID,
			&prescription.DoctorID, &prescription.PharmacyID, &prescription.DatePrescribed,
			&prescription.DateFilled, &prescription.Status, &prescription.Notes, &prescription.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		prescriptions = append(prescriptions, prescription)
	}

	return prescriptions, nil
}

func (s *PrescriptionService) GetPatientPrescriptions(patientID uuid.UUID) ([]*models.Prescription, error) {
	query := `
		SELECT id, prescription_number, patient_id, doctor_id, pharmacy_id, date_prescribed, date_filled, status, notes, created_at
		FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query, patientID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var prescriptions []*models.Prescription
	for rows.Next() {
		prescription := &models.Prescription{}
		err := rows.Scan(
			&prescription.ID, &prescription.PrescriptionNumber, &prescription.PatientID,
			&prescription.DoctorID, &prescription.PharmacyID, &prescription.DatePrescribed,
			&prescription.DateFilled, &prescription.Status, &prescription.Notes, &prescription.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		prescriptions = append(prescriptions, prescription)
	}

	return prescriptions, nil
}

func (s *PrescriptionService) UpdatePrescription(prescription *models.Prescription) error {
	query := `
		UPDATE prescriptions 
		SET patient_id = $2, doctor_id = $3, pharmacy_id = $4, date_prescribed = $5, date_filled = $6, status = $7, notes = $8
		WHERE id = $1
	`

	_, err := s.db.Exec(query,
		prescription.ID, prescription.PatientID, prescription.DoctorID,
		prescription.PharmacyID, prescription.DatePrescribed, prescription.DateFilled,
		prescription.Status, prescription.Notes,
	)

	return err
}

func (s *PrescriptionService) FillPrescription(id uuid.UUID) error {
	query := `
		UPDATE prescriptions 
		SET status = 'filled', date_filled = $2
		WHERE id = $1
	`

	now := time.Now()
	_, err := s.db.Exec(query, id, now)
	return err
}

func (s *PrescriptionService) DeletePrescription(id uuid.UUID) error {
	query := `DELETE FROM prescriptions WHERE id = $1`

	_, err := s.db.Exec(query, id)
	return err
}

func (s *PrescriptionService) AddPrescriptionItem(item *models.PrescriptionItem) error {
	query := `
		INSERT INTO prescription_items (id, prescription_id, medication_id, dosage, frequency, duration, quantity, instructions, refills_remaining)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	item.ID = uuid.New()

	_, err := s.db.Exec(query,
		item.ID, item.PrescriptionID, item.MedicationID, item.Dosage,
		item.Frequency, item.Duration, item.Quantity, item.Instructions, item.RefillsRemaining,
	)

	return err
}

func (s *PrescriptionService) GetPrescriptionItems(prescriptionID uuid.UUID) ([]*models.PrescriptionItem, error) {
	query := `
		SELECT id, prescription_id, medication_id, dosage, frequency, duration, quantity, instructions, refills_remaining
		FROM prescription_items WHERE prescription_id = $1
	`

	rows, err := s.db.Query(query, prescriptionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []*models.PrescriptionItem
	for rows.Next() {
		item := &models.PrescriptionItem{}
		err := rows.Scan(
			&item.ID, &item.PrescriptionID, &item.MedicationID, &item.Dosage,
			&item.Frequency, &item.Duration, &item.Quantity, &item.Instructions, &item.RefillsRemaining,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, nil
}

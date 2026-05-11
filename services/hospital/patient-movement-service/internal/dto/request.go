package dto

// CreatePatientMovementRequest holds the fields required to create a patient-movement.
type CreatePatientMovementRequest struct {
}

// UpdatePatientMovementRequest holds the fields that can be updated on a patient-movement.
type UpdatePatientMovementRequest struct {
	ID string `json:"id"`
}

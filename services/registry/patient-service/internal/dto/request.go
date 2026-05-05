package dto

// CreatePatientRequest holds the fields required to create a patient.
type CreatePatientRequest struct {
}

// UpdatePatientRequest holds the fields that can be updated on a patient.
type UpdatePatientRequest struct {
	ID string `json:"id"`
}

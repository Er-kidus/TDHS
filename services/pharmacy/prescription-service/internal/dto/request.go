package dto

// CreatePrescriptionRequest holds the fields required to create a prescription.
type CreatePrescriptionRequest struct {
}

// UpdatePrescriptionRequest holds the fields that can be updated on a prescription.
type UpdatePrescriptionRequest struct {
	ID string `json:"id"`
}

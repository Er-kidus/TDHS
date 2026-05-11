package dto

// CreateInpatientRequest holds the fields required to create a inpatient.
type CreateInpatientRequest struct {
}

// UpdateInpatientRequest holds the fields that can be updated on a inpatient.
type UpdateInpatientRequest struct {
	ID string `json:"id"`
}

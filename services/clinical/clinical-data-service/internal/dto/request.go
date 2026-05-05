package dto

// CreateClinicalDataRequest holds the fields required to create a clinical-data.
type CreateClinicalDataRequest struct {
}

// UpdateClinicalDataRequest holds the fields that can be updated on a clinical-data.
type UpdateClinicalDataRequest struct {
	ID string `json:"id"`
}

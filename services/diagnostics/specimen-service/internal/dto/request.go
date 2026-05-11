package dto

// CreateSpecimenRequest holds the fields required to create a specimen.
type CreateSpecimenRequest struct {
}

// UpdateSpecimenRequest holds the fields that can be updated on a specimen.
type UpdateSpecimenRequest struct {
	ID string `json:"id"`
}

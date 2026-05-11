package dto

// CreateDrugFormularyRequest holds the fields required to create a drug-formulary.
type CreateDrugFormularyRequest struct {
}

// UpdateDrugFormularyRequest holds the fields that can be updated on a drug-formulary.
type UpdateDrugFormularyRequest struct {
	ID string `json:"id"`
}

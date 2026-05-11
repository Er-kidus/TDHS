package dto

// DrugFormularyResponse is the standard response payload for a single drug-formulary.
type DrugFormularyResponse struct {
	ID string `json:"id"`
}

// ListDrugFormularyResponse is the response payload for a list of drug-formularys.
type ListDrugFormularyResponse struct {
	Items []DrugFormularyResponse `json:"items"`
	Total int                       `json:"total"`
}

package dto

// ClinicalDataResponse is the standard response payload for a single clinical-data.
type ClinicalDataResponse struct {
	ID string `json:"id"`
}

// ListClinicalDataResponse is the response payload for a list of clinical-datas.
type ListClinicalDataResponse struct {
	Items []ClinicalDataResponse `json:"items"`
	Total int                       `json:"total"`
}

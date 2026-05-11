package dto

// DataQualityResponse is the standard response payload for a single data-quality.
type DataQualityResponse struct {
	ID string `json:"id"`
}

// ListDataQualityResponse is the response payload for a list of data-qualitys.
type ListDataQualityResponse struct {
	Items []DataQualityResponse `json:"items"`
	Total int                       `json:"total"`
}

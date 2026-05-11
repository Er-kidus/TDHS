package dto

// DataMappingResponse is the standard response payload for a single data-mapping.
type DataMappingResponse struct {
	ID string `json:"id"`
}

// ListDataMappingResponse is the response payload for a list of data-mappings.
type ListDataMappingResponse struct {
	Items []DataMappingResponse `json:"items"`
	Total int                       `json:"total"`
}

package dto

// CreateDataMappingRequest holds the fields required to create a data-mapping.
type CreateDataMappingRequest struct {
}

// UpdateDataMappingRequest holds the fields that can be updated on a data-mapping.
type UpdateDataMappingRequest struct {
	ID string `json:"id"`
}

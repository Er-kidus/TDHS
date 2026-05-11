package dto

// CreateDataQualityRequest holds the fields required to create a data-quality.
type CreateDataQualityRequest struct {
}

// UpdateDataQualityRequest holds the fields that can be updated on a data-quality.
type UpdateDataQualityRequest struct {
	ID string `json:"id"`
}

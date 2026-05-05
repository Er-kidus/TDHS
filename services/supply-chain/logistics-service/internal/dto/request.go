package dto

// CreateLogisticsRequest holds the fields required to create a logistics.
type CreateLogisticsRequest struct {
}

// UpdateLogisticsRequest holds the fields that can be updated on a logistics.
type UpdateLogisticsRequest struct {
	ID string `json:"id"`
}

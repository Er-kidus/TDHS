package dto

// CreateSurveillanceRequest holds the fields required to create a surveillance.
type CreateSurveillanceRequest struct {
}

// UpdateSurveillanceRequest holds the fields that can be updated on a surveillance.
type UpdateSurveillanceRequest struct {
	ID string `json:"id"`
}

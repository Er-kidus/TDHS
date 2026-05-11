package dto

// CreateFacilityRequest holds the fields required to create a facility.
type CreateFacilityRequest struct {
}

// UpdateFacilityRequest holds the fields that can be updated on a facility.
type UpdateFacilityRequest struct {
	ID string `json:"id"`
}

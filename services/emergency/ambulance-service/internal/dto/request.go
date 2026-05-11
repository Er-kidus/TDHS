package dto

// CreateAmbulanceRequest holds the fields required to create a ambulance.
type CreateAmbulanceRequest struct {
}

// UpdateAmbulanceRequest holds the fields that can be updated on a ambulance.
type UpdateAmbulanceRequest struct {
	ID string `json:"id"`
}

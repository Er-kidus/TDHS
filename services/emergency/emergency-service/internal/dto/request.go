package dto

// CreateEmergencyRequest holds the fields required to create a emergency.
type CreateEmergencyRequest struct {
}

// UpdateEmergencyRequest holds the fields that can be updated on a emergency.
type UpdateEmergencyRequest struct {
	ID string `json:"id"`
}

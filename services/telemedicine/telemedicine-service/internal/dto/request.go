package dto

// CreateTelemedicineRequest holds the fields required to create a telemedicine.
type CreateTelemedicineRequest struct {
}

// UpdateTelemedicineRequest holds the fields that can be updated on a telemedicine.
type UpdateTelemedicineRequest struct {
	ID string `json:"id"`
}

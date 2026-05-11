package dto

// CreateDispensingRequest holds the fields required to create a dispensing.
type CreateDispensingRequest struct {
}

// UpdateDispensingRequest holds the fields that can be updated on a dispensing.
type UpdateDispensingRequest struct {
	ID string `json:"id"`
}

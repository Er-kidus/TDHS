package dto

// CreateSurgeryProtocolRequest holds the fields required to create a surgery-protocol.
type CreateSurgeryProtocolRequest struct {
}

// UpdateSurgeryProtocolRequest holds the fields that can be updated on a surgery-protocol.
type UpdateSurgeryProtocolRequest struct {
	ID string `json:"id"`
}

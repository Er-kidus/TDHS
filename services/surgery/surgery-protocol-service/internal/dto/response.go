package dto

// SurgeryProtocolResponse is the standard response payload for a single surgery-protocol.
type SurgeryProtocolResponse struct {
	ID string `json:"id"`
}

// ListSurgeryProtocolResponse is the response payload for a list of surgery-protocols.
type ListSurgeryProtocolResponse struct {
	Items []SurgeryProtocolResponse `json:"items"`
	Total int                       `json:"total"`
}

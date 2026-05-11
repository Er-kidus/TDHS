package dto

// ResuscitationResponse is the standard response payload for a single resuscitation.
type ResuscitationResponse struct {
	ID string `json:"id"`
}

// ListResuscitationResponse is the response payload for a list of resuscitations.
type ListResuscitationResponse struct {
	Items []ResuscitationResponse `json:"items"`
	Total int                       `json:"total"`
}

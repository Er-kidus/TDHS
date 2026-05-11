package dto

// IdentifierResponse is the standard response payload for a single identifier.
type IdentifierResponse struct {
	ID string `json:"id"`
}

// ListIdentifierResponse is the response payload for a list of identifiers.
type ListIdentifierResponse struct {
	Items []IdentifierResponse `json:"items"`
	Total int                       `json:"total"`
}

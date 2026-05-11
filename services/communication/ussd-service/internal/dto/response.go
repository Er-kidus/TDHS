package dto

// UssdResponse is the standard response payload for a single ussd.
type UssdResponse struct {
	ID string `json:"id"`
}

// ListUssdResponse is the response payload for a list of ussds.
type ListUssdResponse struct {
	Items []UssdResponse `json:"items"`
	Total int                       `json:"total"`
}

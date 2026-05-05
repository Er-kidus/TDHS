package dto

// DispensingResponse is the standard response payload for a single dispensing.
type DispensingResponse struct {
	ID string `json:"id"`
}

// ListDispensingResponse is the response payload for a list of dispensings.
type ListDispensingResponse struct {
	Items []DispensingResponse `json:"items"`
	Total int                       `json:"total"`
}

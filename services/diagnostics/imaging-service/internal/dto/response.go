package dto

// ImagingResponse is the standard response payload for a single imaging.
type ImagingResponse struct {
	ID string `json:"id"`
}

// ListImagingResponse is the response payload for a list of imagings.
type ListImagingResponse struct {
	Items []ImagingResponse `json:"items"`
	Total int                       `json:"total"`
}

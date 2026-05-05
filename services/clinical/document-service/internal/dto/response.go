package dto

// DocumentResponse is the standard response payload for a single document.
type DocumentResponse struct {
	ID string `json:"id"`
}

// ListDocumentResponse is the response payload for a list of documents.
type ListDocumentResponse struct {
	Items []DocumentResponse `json:"items"`
	Total int                       `json:"total"`
}

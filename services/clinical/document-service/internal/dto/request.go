package dto

// CreateDocumentRequest holds the fields required to create a document.
type CreateDocumentRequest struct {
}

// UpdateDocumentRequest holds the fields that can be updated on a document.
type UpdateDocumentRequest struct {
	ID string `json:"id"`
}

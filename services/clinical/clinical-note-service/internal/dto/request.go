package dto

// CreateClinicalNoteRequest holds the fields required to create a clinical-note.
type CreateClinicalNoteRequest struct {
}

// UpdateClinicalNoteRequest holds the fields that can be updated on a clinical-note.
type UpdateClinicalNoteRequest struct {
	ID string `json:"id"`
}

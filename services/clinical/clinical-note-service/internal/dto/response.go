package dto

// ClinicalNoteResponse is the standard response payload for a single clinical-note.
type ClinicalNoteResponse struct {
	ID string `json:"id"`
}

// ListClinicalNoteResponse is the response payload for a list of clinical-notes.
type ListClinicalNoteResponse struct {
	Items []ClinicalNoteResponse `json:"items"`
	Total int                       `json:"total"`
}

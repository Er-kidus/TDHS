package dto

// ProgramResponse is the standard response payload for a single program.
type ProgramResponse struct {
	ID string `json:"id"`
}

// ListProgramResponse is the response payload for a list of programs.
type ListProgramResponse struct {
	Items []ProgramResponse `json:"items"`
	Total int                       `json:"total"`
}

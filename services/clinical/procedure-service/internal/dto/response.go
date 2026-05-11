package dto

// ProcedureResponse is the standard response payload for a single procedure.
type ProcedureResponse struct {
	ID string `json:"id"`
}

// ListProcedureResponse is the response payload for a list of procedures.
type ListProcedureResponse struct {
	Items []ProcedureResponse `json:"items"`
	Total int                       `json:"total"`
}

package dto

// CreateProcedureRequest holds the fields required to create a procedure.
type CreateProcedureRequest struct {
}

// UpdateProcedureRequest holds the fields that can be updated on a procedure.
type UpdateProcedureRequest struct {
	ID string `json:"id"`
}

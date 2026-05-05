package dto

// CreateTeleconsultRequest holds the fields required to create a teleconsult.
type CreateTeleconsultRequest struct {
}

// UpdateTeleconsultRequest holds the fields that can be updated on a teleconsult.
type UpdateTeleconsultRequest struct {
	ID string `json:"id"`
}

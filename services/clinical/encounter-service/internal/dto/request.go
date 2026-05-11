package dto

// CreateEncounterRequest holds the fields required to create a encounter.
type CreateEncounterRequest struct {
}

// UpdateEncounterRequest holds the fields that can be updated on a encounter.
type UpdateEncounterRequest struct {
	ID string `json:"id"`
}

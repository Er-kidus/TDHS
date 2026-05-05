package dto

// CreateTriageRequest holds the fields required to create a triage.
type CreateTriageRequest struct {
}

// UpdateTriageRequest holds the fields that can be updated on a triage.
type UpdateTriageRequest struct {
	ID string `json:"id"`
}

package dto

// CreateTeleTriageRequest holds the fields required to create a tele-triage.
type CreateTeleTriageRequest struct {
}

// UpdateTeleTriageRequest holds the fields that can be updated on a tele-triage.
type UpdateTeleTriageRequest struct {
	ID string `json:"id"`
}

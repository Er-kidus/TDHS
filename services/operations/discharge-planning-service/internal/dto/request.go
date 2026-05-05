package dto

// CreateDischargePlanningRequest holds the fields required to create a discharge-planning.
type CreateDischargePlanningRequest struct {
}

// UpdateDischargePlanningRequest holds the fields that can be updated on a discharge-planning.
type UpdateDischargePlanningRequest struct {
	ID string `json:"id"`
}

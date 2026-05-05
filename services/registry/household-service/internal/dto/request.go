package dto

// CreateHouseholdRequest holds the fields required to create a household.
type CreateHouseholdRequest struct {
}

// UpdateHouseholdRequest holds the fields that can be updated on a household.
type UpdateHouseholdRequest struct {
	ID string `json:"id"`
}

package dto

// CreateRevenueCycleRequest holds the fields required to create a revenue-cycle.
type CreateRevenueCycleRequest struct {
}

// UpdateRevenueCycleRequest holds the fields that can be updated on a revenue-cycle.
type UpdateRevenueCycleRequest struct {
	ID string `json:"id"`
}

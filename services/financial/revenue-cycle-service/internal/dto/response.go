package dto

// RevenueCycleResponse is the standard response payload for a single revenue-cycle.
type RevenueCycleResponse struct {
	ID string `json:"id"`
}

// ListRevenueCycleResponse is the response payload for a list of revenue-cycles.
type ListRevenueCycleResponse struct {
	Items []RevenueCycleResponse `json:"items"`
	Total int                       `json:"total"`
}

package dto

// DischargePlanningResponse is the standard response payload for a single discharge-planning.
type DischargePlanningResponse struct {
	ID string `json:"id"`
}

// ListDischargePlanningResponse is the response payload for a list of discharge-plannings.
type ListDischargePlanningResponse struct {
	Items []DischargePlanningResponse `json:"items"`
	Total int                       `json:"total"`
}

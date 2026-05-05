package dto

// LogisticsResponse is the standard response payload for a single logistics.
type LogisticsResponse struct {
	ID string `json:"id"`
}

// ListLogisticsResponse is the response payload for a list of logisticss.
type ListLogisticsResponse struct {
	Items []LogisticsResponse `json:"items"`
	Total int                       `json:"total"`
}

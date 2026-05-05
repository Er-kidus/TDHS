package dto

// EventBusResponse is the standard response payload for a single event-bus.
type EventBusResponse struct {
	ID string `json:"id"`
}

// ListEventBusResponse is the response payload for a list of event-buss.
type ListEventBusResponse struct {
	Items []EventBusResponse `json:"items"`
	Total int                       `json:"total"`
}

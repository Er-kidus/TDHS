package dto

// CreateEventBusRequest holds the fields required to create a event-bus.
type CreateEventBusRequest struct {
}

// UpdateEventBusRequest holds the fields that can be updated on a event-bus.
type UpdateEventBusRequest struct {
	ID string `json:"id"`
}

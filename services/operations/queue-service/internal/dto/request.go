package dto

// CreateQueueRequest holds the fields required to create a queue.
type CreateQueueRequest struct {
}

// UpdateQueueRequest holds the fields that can be updated on a queue.
type UpdateQueueRequest struct {
	ID string `json:"id"`
}

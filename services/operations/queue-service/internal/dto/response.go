package dto

// QueueResponse is the standard response payload for a single queue.
type QueueResponse struct {
	ID string `json:"id"`
}

// ListQueueResponse is the response payload for a list of queues.
type ListQueueResponse struct {
	Items []QueueResponse `json:"items"`
	Total int                       `json:"total"`
}

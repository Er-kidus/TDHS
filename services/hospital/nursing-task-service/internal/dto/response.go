package dto

// NursingTaskResponse is the standard response payload for a single nursing-task.
type NursingTaskResponse struct {
	ID string `json:"id"`
}

// ListNursingTaskResponse is the response payload for a list of nursing-tasks.
type ListNursingTaskResponse struct {
	Items []NursingTaskResponse `json:"items"`
	Total int                       `json:"total"`
}

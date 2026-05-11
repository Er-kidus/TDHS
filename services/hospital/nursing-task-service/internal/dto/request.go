package dto

// CreateNursingTaskRequest holds the fields required to create a nursing-task.
type CreateNursingTaskRequest struct {
}

// UpdateNursingTaskRequest holds the fields that can be updated on a nursing-task.
type UpdateNursingTaskRequest struct {
	ID string `json:"id"`
}

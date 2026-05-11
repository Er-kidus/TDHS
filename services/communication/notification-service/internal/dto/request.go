package dto

// CreateNotificationRequest holds the fields required to create a notification.
type CreateNotificationRequest struct {
}

// UpdateNotificationRequest holds the fields that can be updated on a notification.
type UpdateNotificationRequest struct {
	ID string `json:"id"`
}

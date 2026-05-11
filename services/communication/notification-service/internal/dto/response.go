package dto

// NotificationResponse is the standard response payload for a single notification.
type NotificationResponse struct {
	ID string `json:"id"`
}

// ListNotificationResponse is the response payload for a list of notifications.
type ListNotificationResponse struct {
	Items []NotificationResponse `json:"items"`
	Total int                       `json:"total"`
}

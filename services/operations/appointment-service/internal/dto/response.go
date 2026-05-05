package dto

// AppointmentResponse is the standard response payload for a single appointment.
type AppointmentResponse struct {
	ID string `json:"id"`
}

// ListAppointmentResponse is the response payload for a list of appointments.
type ListAppointmentResponse struct {
	Items []AppointmentResponse `json:"items"`
	Total int                       `json:"total"`
}

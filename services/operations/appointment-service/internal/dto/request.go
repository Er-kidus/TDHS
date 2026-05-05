package dto

// CreateAppointmentRequest holds the fields required to create a appointment.
type CreateAppointmentRequest struct {
}

// UpdateAppointmentRequest holds the fields that can be updated on a appointment.
type UpdateAppointmentRequest struct {
	ID string `json:"id"`
}

package model

import "time"

// Base model shared across entities.
type Base struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Patient struct {
	Base
	TenantID *string        `json:"tenant_id,omitempty"`
	FullName string         `json:"full_name"`
	Email    string         `json:"email"`
	Phone    string         `json:"phone"`
	Profile  map[string]any `json:"profile"`
	Active   bool           `json:"active"`
}

type User struct {
	Base
	TenantID       *string `json:"tenant_id,omitempty"`
	OrganizationID *string `json:"organization_id,omitempty"`
	FullName       string  `json:"full_name"`
	Email          string  `json:"email"`
	Role           string  `json:"role"`
	Active         bool    `json:"active"`
}

type Appointment struct {
	Base
	TenantID                 *string   `json:"tenant_id,omitempty"`
	PatientID                string    `json:"patient_id"`
	CreatedBy                *string   `json:"created_by,omitempty"`
	ScheduledAt              time.Time `json:"scheduled_at"`
	Status                   string    `json:"status"`
	Reason                   *string   `json:"reason,omitempty"`
	Notes                    *string   `json:"notes,omitempty"`
	Description              *string   `json:"description,omitempty"`
	Priority                 *string   `json:"priority,omitempty"`
	AppointmentType          *string   `json:"appointmentType,omitempty"`
	ServiceType              *string   `json:"serviceType,omitempty"`
	ServiceCategory          *string   `json:"serviceCategory,omitempty"`
	FacilityID               *string   `json:"facilityId,omitempty"`
	FacilityName             *string   `json:"facilityName,omitempty"`
	FacilityAddress          *string   `json:"facilityAddress,omitempty"`
	NearbyHospitalID         *string   `json:"nearbyHospitalId,omitempty"`
	NearbyHospitalName       *string   `json:"nearbyHospitalName,omitempty"`
	NearbyHospitalAddress    *string   `json:"nearbyHospitalAddress,omitempty"`
	NearbyHospitalDistanceKm *float64  `json:"nearbyHospitalDistanceKm,omitempty"`
	Location                 *string   `json:"location,omitempty"`
	AssignedStaffType        *string   `json:"assignedStaffType,omitempty"`
	AssignedRoom             *string   `json:"assignedRoom,omitempty"`
	AssignedEquipment        *string   `json:"assignedEquipment,omitempty"`
}

type ServiceDefinition struct {
	Base
	TenantID            *string `json:"tenant_id,omitempty"`
	Name                string  `json:"name"`
	Description         *string `json:"description,omitempty"`
	ServiceCategory     string  `json:"serviceCategory"`
	ServiceType         string  `json:"serviceType"`
	Active              bool    `json:"active"`
	DurationMinutes     int     `json:"duration_minutes"`
	BufferBeforeMinutes int     `json:"buffer_before_minutes"`
	BufferAfterMinutes  int     `json:"buffer_after_minutes"`
	RequiresAppointment bool    `json:"requires_appointment"`
	AllowsWalkin        bool    `json:"allows_walkin"`
	RequiresCheckin     bool    `json:"requires_checkin"`
	SupportsRecurrence  bool    `json:"supports_recurrence"`
	AllowedPatternsJSON string  `json:"allowed_patterns"`
	MaxOccurrences      *int    `json:"max_occurrences,omitempty"`
}

type ResourcePool struct {
	ID               string    `json:"id"`
	TenantID         *string   `json:"tenant_id,omitempty"`
	Type             string    `json:"type"`
	Category         string    `json:"category"`
	Label            string    `json:"label"`
	Status           string    `json:"status"`
	FacilityID       *string   `json:"facility_id,omitempty"`
	AvailabilityJSON string    `json:"availability_schedule"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

type QueueEntry struct {
	QueueID              string  `json:"queue_id"`
	QueueServiceType     string  `json:"service_type"`
	QueueFacility        *string `json:"facility,omitempty"`
	AppointmentID        string  `json:"appointment_id"`
	Position             int     `json:"position"`
	Status               string  `json:"status"`
	EstimatedWaitMinutes int     `json:"estimated_wait_minutes"`
}

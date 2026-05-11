package model

type Appointment struct {
	ID                    string `json:"id"`
	PatientLogicalID      string `json:"patientLogicalId"`
	PractitionerLogicalID string `json:"practitionerLogicalId,omitempty"`
	OrganizationLogicalID string `json:"organizationLogicalId,omitempty"`
	SlotID                string `json:"slotId,omitempty"`
	ScheduledAt           string `json:"scheduledAt"`
	Status                string `json:"status"`
}

type CreateAppointmentRequest struct {
	PatientLogicalID      string `json:"patientLogicalId"`
	PractitionerLogicalID string `json:"practitionerLogicalId"`
	OrganizationLogicalID string `json:"organizationLogicalId"`
	SlotID                string `json:"slotId,omitempty"`
	ScheduledAt           string `json:"scheduledAt"`
}

type CancelAppointmentRequest struct {
	AppointmentID string `json:"appointmentId"`
}

type RescheduleAppointmentRequest struct {
	AppointmentID string `json:"appointmentId"`
	ScheduledAt   string `json:"scheduledAt"`
	SlotID        string `json:"slotId,omitempty"`
}

type AppointmentActionRequest struct {
	AppointmentID string `json:"appointmentId"`
}

type Slot struct {
	ID                    string `json:"id"`
	PractitionerLogicalID string `json:"practitionerLogicalId,omitempty"`
	OrganizationLogicalID string `json:"organizationLogicalId,omitempty"`
	StartAt               string `json:"startAt"`
	EndAt                 string `json:"endAt"`
	Status                string `json:"status"`
}

type CreateSlotRequest struct {
	PractitionerLogicalID string `json:"practitionerLogicalId"`
	OrganizationLogicalID string `json:"organizationLogicalId"`
	StartAt               string `json:"startAt"`
	EndAt                 string `json:"endAt"`
}

type QueueEntry struct {
	ID                string `json:"id"`
	AppointmentID     string `json:"appointmentId,omitempty"`
	PatientLogicalID  string `json:"patientLogicalId"`
	LocationLogicalID string `json:"locationLogicalId,omitempty"`
	Status            string `json:"status"`
	Position          int    `json:"position"`
	CreatedAt         string `json:"createdAt"`
}

type EnqueueRequest struct {
	AppointmentID     string `json:"appointmentId,omitempty"`
	PatientLogicalID  string `json:"patientLogicalId"`
	LocationLogicalID string `json:"locationLogicalId"`
}

type CheckInRequest struct {
	QueueEntryID string `json:"queueEntryId"`
}

type QueueActionRequest struct {
	QueueEntryID string `json:"queueEntryId"`
}

type TriageAssessment struct {
	ID                string        `json:"id"`
	PatientLogicalID  string        `json:"patientLogicalId"`
	Symptoms          []string      `json:"symptoms"`
	RedFlags          []string      `json:"redFlags"`
	Vitals            VitalSigns    `json:"vitals"`
	Context           TriageContext `json:"context"`
	Severity          string        `json:"severity"`
	Score             int           `json:"score"`
	RecommendedAction string        `json:"recommendedAction"`
	Suggestions       []string      `json:"suggestions,omitempty"`
	AISeverity        string        `json:"aiSeverity,omitempty"`
	AIScore           int           `json:"aiScore,omitempty"`
	AIConfidence      float64       `json:"aiConfidence,omitempty"`
	AIFallbackUsed    bool          `json:"aiFallbackUsed,omitempty"`
	AIModelVersion    string        `json:"aiModelVersion,omitempty"`
	AIReasons         []string      `json:"aiReasons,omitempty"`
	CreatedAt         string        `json:"createdAt"`
}

type VitalSigns struct {
	SystolicBP       int     `json:"systolicBp,omitempty"`
	DiastolicBP      int     `json:"diastolicBp,omitempty"`
	HeartRate        int     `json:"heartRate,omitempty"`
	RespiratoryRate  int     `json:"respiratoryRate,omitempty"`
	TemperatureC     float64 `json:"temperatureC,omitempty"`
	OxygenSaturation int     `json:"oxygenSaturation,omitempty"`
	BloodGlucoseMgDl int     `json:"bloodGlucoseMgDl,omitempty"`
	PainScore        int     `json:"painScore,omitempty"`
	Consciousness    string  `json:"consciousness,omitempty"`
	WeightKg         float64 `json:"weightKg,omitempty"`
	HeightCm         float64 `json:"heightCm,omitempty"`
}

type TriageContext struct {
	Pregnant           bool     `json:"pregnant,omitempty"`
	Trimester          int      `json:"trimester,omitempty"`
	ChronicConditions  []string `json:"chronicConditions,omitempty"`
	CurrentMedications []string `json:"currentMedications,omitempty"`
	KnownAllergies     []string `json:"knownAllergies,omitempty"`
	ChiefComplaint     string   `json:"chiefComplaint,omitempty"`
	OnsetHours         int      `json:"onsetHours,omitempty"`
}

type TriageRequest struct {
	PatientLogicalID string        `json:"patientLogicalId"`
	Symptoms         []string      `json:"symptoms"`
	RedFlags         []string      `json:"redFlags"`
	AgeYears         int           `json:"ageYears,omitempty"`
	Channel          string        `json:"channel,omitempty"`
	Vitals           VitalSigns    `json:"vitals,omitempty"`
	Context          TriageContext `json:"context,omitempty"`
}

type ActivateTriageModelRequest struct {
	ModelVersion  string `json:"modelVersion"`
	ScorerBaseURL string `json:"scorerBaseUrl"`
	TimeoutMS     int    `json:"timeoutMs,omitempty"`
	Reason        string `json:"reason,omitempty"`
}

type RollbackTriageModelRequest struct {
	Reason string `json:"reason,omitempty"`
}

type TriageModelActionMetadata struct {
	Actor  string
	Reason string
}

type TriageModelAuditEvent struct {
	Action        string `json:"action"`
	ModelVersion  string `json:"modelVersion"`
	ScorerBaseURL string `json:"scorerBaseUrl"`
	Actor         string `json:"actor,omitempty"`
	Reason        string `json:"reason,omitempty"`
	At            string `json:"at"`
	Result        string `json:"result"`
}

type TriageModelStatus struct {
	Enabled         bool                    `json:"enabled"`
	ModelVersion    string                  `json:"modelVersion,omitempty"`
	ScorerBaseURL   string                  `json:"scorerBaseUrl,omitempty"`
	TimeoutMS       int                     `json:"timeoutMs,omitempty"`
	LastActivatedAt string                  `json:"lastActivatedAt,omitempty"`
	AuditEvents     []TriageModelAuditEvent `json:"auditEvents,omitempty"`
}

type ListQuery struct {
	Query  string
	Limit  int
	Offset int
	Sort   string
}

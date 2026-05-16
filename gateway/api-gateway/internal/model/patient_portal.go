package model

import "time"

type Doctor struct {
	Base
	FullName             string     `json:"full_name"`
	Specialty            string     `json:"specialty"`
	Location             string     `json:"location"`
	Rating               float64    `json:"rating"`
	YearsExp             int        `json:"years_experience"`
	Available            bool       `json:"available"`
	Online               bool       `json:"online"`
	TelemedicineEnabled  bool       `json:"telemedicine_enabled"`
	ConsultationRate     float64    `json:"consultation_rate"`
	ConsultationCurrency string     `json:"consultation_currency"`
	TelemedicineModes    []string   `json:"telemedicine_modes"`
	AvailableAt          *time.Time `json:"available_at,omitempty"`
	SubSpecialty         *string    `json:"sub_specialty,omitempty"`
	Languages            []string   `json:"languages,omitempty"`
	ConsultationModes    []string   `json:"consultation_modes,omitempty"`
	EmergencySupport     bool       `json:"emergency_support,omitempty"`
	CurrentSessions      int        `json:"current_sessions,omitempty"`
	SessionCapacity      int        `json:"session_capacity,omitempty"`
}

type TelemedicineProfileUpdate struct {
	TelemedicineEnabled   *bool
	TelemedicineSpecialty *string
	TelemedicineRate      *float64
	TelemedicineCurrency  *string
	TelemedicineModes     *[]string
	SubSpecialty          *string
	YearsExperience       *int
	LanguagesSpoken       *[]string
	OnlineStatus          *string
	SessionCapacity       *int
	Certifications        *[]string
	AreasOfExpertise      *[]string
	EmergencySupport      *bool
	AvailabilitySchedule  map[string]any
	ProfileCompleteness   *int
}


type Prescription struct {
	Base
	PatientID         string     `json:"patient_id"`
	PrescribingDoctor string     `json:"prescribing_doctor"`
	MedicationName    string     `json:"medication_name"`
	Dosage            string     `json:"dosage"`
	Frequency         string     `json:"frequency"`
	RefillDueDate     *time.Time `json:"refill_due_date,omitempty"`
	Status            string     `json:"status"`
}

type LabResult struct {
	Base
	PatientID   string     `json:"patient_id"`
	TestName    string     `json:"test_name"`
	Status      string     `json:"status"`
	ResultValue *string    `json:"result_value,omitempty"`
	NormalRange *string    `json:"normal_range,omitempty"`
	Abnormal    bool       `json:"abnormal"`
	CollectedAt *time.Time `json:"collected_at,omitempty"`
}

type Invoice struct {
	Base
	PatientID     string     `json:"patient_id"`
	InvoiceNumber string     `json:"invoice_number"`
	Amount        float64    `json:"amount"`
	Currency      string     `json:"currency"`
	Status        string     `json:"status"`
	DueDate       *time.Time `json:"due_date,omitempty"`
}

type Insurance struct {
	Base
	PatientID     string         `json:"patient_id"`
	Provider      string         `json:"provider"`
	PolicyNumber  string         `json:"policy_number"`
	Coverage      string         `json:"coverage"`
	ValidFrom     *time.Time     `json:"valid_from,omitempty"`
	ValidTo       *time.Time     `json:"valid_to,omitempty"`
	ClaimsHistory map[string]any `json:"claims_history"`
}

type PatientMessage struct {
	Base
	PatientID     string  `json:"patient_id"`
	Sender        string  `json:"sender"`
	Channel       string  `json:"channel"`
	Content       string  `json:"content"`
	AttachmentURL *string `json:"attachment_url,omitempty"`
	Read          bool    `json:"read"`
}

type PatientDocument struct {
	Base
	PatientID string  `json:"patient_id"`
	Name      string  `json:"name"`
	Category  string  `json:"category"`
	URL       *string `json:"url,omitempty"`
}

type TelemedicineSession struct {
	Base
	PatientID         string    `json:"patient_id"`
	DoctorID          *string   `json:"doctor_id,omitempty"`
	DoctorName        string    `json:"doctor_name"`
	ScheduledAt       time.Time `json:"scheduled_at"`
	PreferredMode     string    `json:"preferred_mode"`
	RequestedAmount   float64   `json:"requested_amount"`
	RequestedCurrency string    `json:"requested_currency"`
	Status            string    `json:"status"`
	ConnectionStatus  string    `json:"connection_status"`
	Notes             *string   `json:"notes,omitempty"`
	AIUrgencyLevel    *string   `json:"ai_urgency_level,omitempty"`
	AITriageScore     *int      `json:"ai_triage_score,omitempty"`
	AISpecialty       *string   `json:"ai_specialty,omitempty"`
}

type PharmacyMedication struct {
	Base
	Name                 string  `json:"name"`
	Dosage               string  `json:"dosage"`
	QuantityLabel        string  `json:"quantity_label"`
	Price                float64 `json:"price"`
	Currency             string  `json:"currency"`
	PrescriptionRequired bool    `json:"prescription_required"`
	InStock              bool    `json:"in_stock"`
}

type PharmacyLocation struct {
	Base
	Name       string  `json:"name"`
	Location   string  `json:"location"`
	DistanceKM float64 `json:"distance_km"`
	ETAMinutes int     `json:"eta_minutes"`
	OpenNow    bool    `json:"open_now"`
}

type PharmacyOrder struct {
	Base
	PatientID    string  `json:"patient_id"`
	MedicationID *string `json:"medication_id,omitempty"`
	Quantity     int     `json:"quantity"`
	TotalAmount  float64 `json:"total_amount"`
	Currency     string  `json:"currency"`
	Status       string  `json:"status"`
	DeliveryMode string  `json:"delivery_mode"`
}

type ChronicCareRecord struct {
	Base
	PatientID            string         `json:"patient_id"`
	OrganizationID       string         `json:"organization_id"`
	AssignedProviderID   *string        `json:"assigned_provider_id,omitempty"`
	ConditionName        string         `json:"condition_name"`
	ICDCode              *string        `json:"icd_code,omitempty"`
	CarePlan             string         `json:"care_plan"`
	AlertThresholds      map[string]any `json:"alert_thresholds"`
	MonitoringFrequency  string         `json:"monitoring_frequency"`
	SeverityLevel        string         `json:"severity_level"`
	RiskScore            float64        `json:"risk_score"`
	Status               string         `json:"status"`
	LastReviewAt         *time.Time     `json:"last_review_at,omitempty"`
}

type PregnancyRecord struct {
	Base
	PatientID              string         `json:"patient_id"`
	OrganizationID         string         `json:"organization_id"`
	AssignedProviderID     *string        `json:"assigned_provider_id,omitempty"`
	LMP                    *time.Time     `json:"lmp,omitempty"`
	ExpectedDeliveryDate   *time.Time     `json:"expected_delivery_date,omitempty"`
	GestationalAgeWeeks    *int           `json:"gestational_age_weeks,omitempty"`
	Trimester              int            `json:"trimester"`
	Gravidity              int            `json:"gravidity"`
	Parity                 int            `json:"parity"`
	HighRisk               bool           `json:"high_risk"`
	RiskFactors            []string       `json:"risk_factors"`
	ExistingConditions     []string       `json:"existing_conditions"`
	MonitoringRequirements map[string]any `json:"monitoring_requirements"`
	Notes                  string         `json:"notes"`
	SeverityLevel          string         `json:"severity_level"`
	Status                 string         `json:"status"`
	ClosedAt               *time.Time     `json:"closed_at,omitempty"`
}

type RecurrentMedicationRecord struct {
	Base
	PatientID               string     `json:"patient_id"`
	MedicationName          string     `json:"medication_name"`
	TakenToday              bool       `json:"taken_today"`
	AdherencePercent        float64    `json:"adherence_percent"`
	AppointmentSeverity     string     `json:"appointment_severity"`
	MedicationAlertSeverity string     `json:"medication_alert_severity"`
	LastTakenAt             *time.Time `json:"last_taken_at,omitempty"`
	DietNotes               string     `json:"diet_notes"`
}

type AIUserConsent struct {
	Base
	PatientID      string `json:"patient_id"`
	AllowLearning  bool   `json:"allow_learning"`
	AllowSummaries bool   `json:"allow_summaries"`
	AllowAnalytics bool   `json:"allow_analytics"`
	UpdatedBy      string `json:"updated_by"`
}

type AIModel struct {
	Base
	ModelKey    string `json:"model_key"`
	DisplayName string `json:"display_name"`
	Mode        string `json:"mode"`
	Status      string `json:"status"`
	Version     string `json:"version"`
	DatasetRef  string `json:"dataset_ref"`
}

type AILearningSample struct {
	Base
	PatientID      string         `json:"patient_id"`
	Mode           string         `json:"mode"`
	SampleType     string         `json:"sample_type"`
	Payload        map[string]any `json:"payload"`
	ConsentApplied bool           `json:"consent_applied"`
}

type TelemedicineSessionArtifact struct {
	Base
	SessionID      string   `json:"session_id"`
	PatientID      string   `json:"patient_id"`
	DoctorID       *string  `json:"doctor_id,omitempty"`
	RecordingURL   *string  `json:"recording_url,omitempty"`
	TranscriptURL  *string  `json:"transcript_url,omitempty"`
	Summary        string   `json:"summary"`
	FinalDiagnosis string   `json:"final_diagnosis"`
	Symptoms       []string `json:"symptoms"`
	FollowUpNeeded bool     `json:"follow_up_needed"`
}

type TelemedicineTranscriptLine struct {
	Base
	SessionID  string    `json:"session_id"`
	PatientID  string    `json:"patient_id"`
	Speaker    string    `json:"speaker"`
	Source     string    `json:"source"`
	Content    string    `json:"content"`
	OccurredAt time.Time `json:"occurred_at"`
}

type VisitSummary struct {
	ID            string    `json:"id"`
	AppointmentID string    `json:"appointment_id"`
	PatientID     string    `json:"patient_id"`
	Summary       string    `json:"summary"`
	Disposition   string    `json:"disposition"`
	ServiceType   *string   `json:"service_type,omitempty"`
	FacilityName  *string   `json:"facility_name,omitempty"`
	ScheduledAt   *string   `json:"scheduled_at,omitempty"`
	CreatedAt     time.Time `json:"created_at"`
}

type LabOrder struct {
	ID                   string     `json:"id"`
	AppointmentID        string     `json:"appointment_id"`
	PatientID            string     `json:"patient_id"`
	PatientName          string     `json:"patient_name"`
	OrderID              string     `json:"order_id"`
	ServiceArea          string     `json:"service_area"`
	TestName             string     `json:"test_name"`
	Indication           *string    `json:"indication,omitempty"`
	Priority             string     `json:"priority"`
	Status               string     `json:"status"`
	VerificationStatus   string     `json:"verification_status"`
	SampleLabel          *string    `json:"sample_label,omitempty"`
	ResultValue          *string    `json:"result_value,omitempty"`
	ResultNotes          *string    `json:"result_notes,omitempty"`
	ResultEnteredAt      *time.Time `json:"result_entered_at,omitempty"`
	CriticalAlert        bool       `json:"critical_alert"`
	AcknowledgedByDoctor bool       `json:"acknowledged_by_doctor"`
	ConfirmedAt          *time.Time `json:"confirmed_at,omitempty"`
	CreatedAt            time.Time  `json:"created_at"`
	UpdatedAt            time.Time  `json:"updated_at"`
}

type DoctorPrescription struct {
	ID            string    `json:"id"`
	AppointmentID string    `json:"appointment_id"`
	PatientID     string    `json:"patient_id"`
	Medication    string    `json:"medication"`
	Dosage        string    `json:"dosage"`
	Frequency     string    `json:"frequency"`
	DurationDays  int       `json:"duration_days"`
	Instructions  *string   `json:"instructions,omitempty"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

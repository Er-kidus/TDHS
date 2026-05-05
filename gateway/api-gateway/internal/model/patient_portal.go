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
	PatientID     string     `json:"patient_id"`
	ConditionName string     `json:"condition_name"`
	CarePlan      string     `json:"care_plan"`
	SeverityLevel string     `json:"severity_level"`
	RiskScore     float64    `json:"risk_score"`
	LastReviewAt  *time.Time `json:"last_review_at,omitempty"`
}

type PregnancyRecord struct {
	Base
	PatientID            string     `json:"patient_id"`
	Trimester            int        `json:"trimester"`
	ExpectedDeliveryDate *time.Time `json:"expected_delivery_date,omitempty"`
	HighRisk             bool       `json:"high_risk"`
	Notes                string     `json:"notes"`
	SeverityLevel        string     `json:"severity_level"`
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

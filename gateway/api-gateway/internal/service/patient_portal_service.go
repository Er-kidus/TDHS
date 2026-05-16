package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/tenadam/api-gateway/config"
	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type PatientPortalService struct {
	cfg  *config.Config
	repo *repository.Repository
}

func NewPatientPortalService(cfg *config.Config, repo *repository.Repository) *PatientPortalService {
	return &PatientPortalService{cfg: cfg, repo: repo}
}

func (s *PatientPortalService) ListDoctors(ctx context.Context, limit int) ([]*model.Doctor, error) {
	return s.repo.ListDoctors(ctx, limit)
}

func (s *PatientPortalService) GetAvailableDoctorsBySpecialty(ctx context.Context, specialty, urgency string, limit int) ([]*model.Doctor, error) {
	return s.repo.GetAvailableDoctorsBySpecialty(ctx, specialty, urgency, limit)
}

func (s *PatientPortalService) UpdateDoctorOnlineStatus(ctx context.Context, userID, status string) error {
	return s.repo.UpdateDoctorOnlineStatus(ctx, userID, status)
}

func (s *PatientPortalService) ListPrescriptions(ctx context.Context, patientID string, limit int) ([]*model.Prescription, error) {
	return s.repo.ListPrescriptionsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListLabResults(ctx context.Context, patientID string, limit int) ([]*model.LabResult, error) {
	return s.repo.ListLabResultsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListVisitSummaries(ctx context.Context, patientID string, limit int) ([]*model.VisitSummary, error) {
	return s.repo.ListVisitSummariesByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListLabOrders(ctx context.Context, patientID string, limit int) ([]*model.LabOrder, error) {
	return s.repo.ListLabOrdersByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListDoctorPrescriptions(ctx context.Context, patientID string, limit int) ([]*model.DoctorPrescription, error) {
	return s.repo.ListDoctorPrescriptionsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) CheckAppointmentConflict(ctx context.Context, patientID string, scheduledAt time.Time) (bool, error) {
	return s.repo.CheckAppointmentConflict(ctx, patientID, scheduledAt)
}


func (s *PatientPortalService) ListInvoices(ctx context.Context, patientID string, limit int) ([]*model.Invoice, error) {
	return s.repo.ListInvoicesByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) GetInsurance(ctx context.Context, patientID string) (*model.Insurance, error) {
	return s.repo.GetInsuranceByPatient(ctx, patientID)
}

func (s *PatientPortalService) ListMessages(ctx context.Context, patientID string, limit int) ([]*model.PatientMessage, error) {
	return s.repo.ListMessagesByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListMessagesByChannel(ctx context.Context, channel string, limit int) ([]*model.PatientMessage, error) {
	return s.repo.ListMessagesByChannel(ctx, channel, limit)
}

func (s *PatientPortalService) CreateMessage(ctx context.Context, patientID, sender, channel, content string, attachmentURL *string) (*model.PatientMessage, error) {
	return s.repo.CreateMessage(ctx, patientID, sender, channel, content, attachmentURL)
}

func (s *PatientPortalService) ListDocuments(ctx context.Context, patientID string, limit int) ([]*model.PatientDocument, error) {
	return s.repo.ListDocumentsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) CreateDocument(ctx context.Context, patientID, name, category string, url *string) (*model.PatientDocument, error) {
	return s.repo.CreateDocument(ctx, patientID, name, category, url)
}

func (s *PatientPortalService) ListTelemedicineSessions(ctx context.Context, patientID string, limit int) ([]*model.TelemedicineSession, error) {
	return s.repo.ListTelemedicineSessionsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) CreateTelemedicineSession(ctx context.Context, patientID string, doctorID *string, doctorName string, scheduledAt time.Time, preferredMode string, requestedAmount float64, requestedCurrency string, notes *string, aiUrgencyLevel *string, aiTriageScore *int, aiSpecialty *string) (*model.TelemedicineSession, error) {
	if preferredMode == "" {
		preferredMode = "video"
	}
	if requestedCurrency == "" {
		requestedCurrency = "ETB"
	}
	return s.repo.CreateTelemedicineSession(ctx, patientID, doctorID, doctorName, scheduledAt, preferredMode, requestedAmount, requestedCurrency, notes, aiUrgencyLevel, aiTriageScore, aiSpecialty)
}

func (s *PatientPortalService) ListTelemedicineQueueByOrganization(ctx context.Context, organizationID string, limit int) ([]*model.TelemedicineSession, error) {
	return s.repo.ListTelemedicineQueueByOrganization(ctx, organizationID, limit)
}

func (s *PatientPortalService) AcceptTelemedicineSession(ctx context.Context, organizationID, sessionID, doctorID string) (*model.TelemedicineSession, error) {
	return s.repo.AcceptTelemedicineSession(ctx, organizationID, sessionID, doctorID)
}

func (s *PatientPortalService) MarkTelemedicineSessionInProgress(ctx context.Context, sessionID, doctorID string) (*model.TelemedicineSession, error) {
	return s.repo.MarkTelemedicineSessionInProgress(ctx, sessionID, doctorID)
}

func (s *PatientPortalService) ListPharmacyMedications(ctx context.Context, limit int) ([]*model.PharmacyMedication, error) {
	return s.repo.ListPharmacyMedications(ctx, limit)
}

func (s *PatientPortalService) ListPharmacies(ctx context.Context, limit int) ([]*model.PharmacyLocation, error) {
	return s.repo.ListPharmacies(ctx, limit)
}

func (s *PatientPortalService) ListPharmacyOrders(ctx context.Context, patientID string, limit int) ([]*model.PharmacyOrder, error) {
	return s.repo.ListPharmacyOrdersByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) CreatePharmacyOrder(ctx context.Context, patientID string, medicationID *string, quantity int, total float64, currency, deliveryMode string) (*model.PharmacyOrder, error) {
	return s.repo.CreatePharmacyOrder(ctx, patientID, medicationID, quantity, total, currency, deliveryMode)
}

func (s *PatientPortalService) ListChronicCare(ctx context.Context, patientID string, limit int) ([]*model.ChronicCareRecord, error) {
	return s.repo.ListChronicCareByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListPregnancyCare(ctx context.Context, patientID string, limit int) ([]*model.PregnancyRecord, error) {
	return s.repo.ListPregnancyCareByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) OrgCreatePregnancyEpisode(ctx context.Context, params map[string]any) (*model.PregnancyRecord, error) {
	return s.repo.OrgCreatePregnancyEpisode(ctx, params)
}

func (s *PatientPortalService) OrgListPregnancyEpisodes(ctx context.Context, orgID string, limit int) ([]*model.PregnancyRecord, error) {
	return s.repo.OrgListPregnancyEpisodes(ctx, orgID, limit)
}

func (s *PatientPortalService) OrgCreateChronicEnrollment(ctx context.Context, params map[string]any) (*model.ChronicCareRecord, error) {
	return s.repo.OrgCreateChronicEnrollment(ctx, params)
}

func (s *PatientPortalService) OrgListChronicEnrollments(ctx context.Context, orgID string, limit int) ([]*model.ChronicCareRecord, error) {
	return s.repo.OrgListChronicEnrollments(ctx, orgID, limit)
}

func (s *PatientPortalService) ListRecurrentMedications(ctx context.Context, patientID string, limit int) ([]*model.RecurrentMedicationRecord, error) {
	return s.repo.ListRecurrentMedicationsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) GetAIConsent(ctx context.Context, patientID string) (*model.AIUserConsent, error) {
	return s.repo.GetAIConsentByPatient(ctx, patientID)
}

func (s *PatientPortalService) UpsertAIConsent(ctx context.Context, patientID string, allowLearning, allowSummaries, allowAnalytics bool, updatedBy string) (*model.AIUserConsent, error) {
	return s.repo.UpsertAIConsent(ctx, patientID, allowLearning, allowSummaries, allowAnalytics, updatedBy)
}

func (s *PatientPortalService) ListAIModels(ctx context.Context) ([]*model.AIModel, error) {
	return s.repo.ListAIModels(ctx)
}

func (s *PatientPortalService) SetAIModelStatus(ctx context.Context, modelKey, status string) (*model.AIModel, error) {
	return s.repo.SetAIModelStatus(ctx, modelKey, status)
}

func (s *PatientPortalService) InsertAILearningSample(ctx context.Context, patientID, mode, sampleType string, payload map[string]any, consentApplied bool) (*model.AILearningSample, error) {
	return s.repo.InsertAILearningSample(ctx, patientID, mode, sampleType, payload, consentApplied)
}

func (s *PatientPortalService) ListTelemedicineArtifactsByPatient(ctx context.Context, patientID string, limit int) ([]*model.TelemedicineSessionArtifact, error) {
	return s.repo.ListTelemedicineArtifactsByPatient(ctx, patientID, limit)
}

func (s *PatientPortalService) ListTelemedicineArtifactsForOrg(ctx context.Context, limit int) ([]*model.TelemedicineSessionArtifact, error) {
	return s.repo.ListTelemedicineArtifactsForOrg(ctx, limit)
}

func (s *PatientPortalService) CreateTelemedicineTranscriptLine(ctx context.Context, sessionID, patientID, speaker, source, content string, occurredAt *time.Time) (*model.TelemedicineTranscriptLine, error) {
	if source == "" {
		source = "manual"
	}
	return s.repo.CreateTelemedicineTranscriptLine(ctx, sessionID, patientID, speaker, source, content, occurredAt)
}

func (s *PatientPortalService) ListTelemedicineTranscriptLinesBySession(ctx context.Context, sessionID string, limit int) ([]*model.TelemedicineTranscriptLine, error) {
	return s.repo.ListTelemedicineTranscriptLinesBySession(ctx, sessionID, limit)
}

func (s *PatientPortalService) CreateOrgDoctor(ctx context.Context, fullName, email, specialty, licenseNumber string) (map[string]any, error) {
	return s.repo.CreateOrgDoctor(ctx, fullName, email, specialty, licenseNumber)
}

func (s *PatientPortalService) ListOrgDoctors(ctx context.Context, limit int) ([]map[string]any, error) {
	return s.repo.ListOrgDoctors(ctx, limit)
}

func (s *PatientPortalService) CreateOrgPharmacy(ctx context.Context, name, location string) (map[string]any, error) {
	return s.repo.CreateOrgPharmacy(ctx, name, location)
}

func (s *PatientPortalService) ListOrgPharmacies(ctx context.Context, limit int) ([]map[string]any, error) {
	return s.repo.ListOrgPharmacies(ctx, limit)
}

func (s *PatientPortalService) ListOrgUsers(ctx context.Context, limit int) ([]map[string]any, error) {
	return s.repo.ListOrgUsers(ctx, limit)
}

func (s *PatientPortalService) ListOrganizations(ctx context.Context) ([]map[string]any, error) {
	return s.repo.ListOrganizations(ctx)
}

func (s *PatientPortalService) ListOrganizationTiers(ctx context.Context) ([]map[string]any, error) {
	return s.repo.ListTierRequirements(ctx)
}

func (s *PatientPortalService) UpdateTierDefaults(ctx context.Context, tier string, defaultServices []string) error {
	return s.repo.UpdateTierDefaults(ctx, tier, defaultServices)
}

func (s *PatientPortalService) ListOrganizationsWithConfiguration(ctx context.Context, search string) ([]map[string]any, error) {
	return s.repo.ListOrganizationsWithConfiguration(ctx, search)
}

func (s *PatientPortalService) GetOrganizationConfiguration(ctx context.Context, organizationID string) (map[string]any, error) {
	return s.repo.GetOrganizationConfiguration(ctx, organizationID)
}

func (s *PatientPortalService) UpsertOrganizationConfiguration(
	ctx context.Context,
	organizationID,
	tier string,
	enabledServices []string,
	minStaff map[string]int,
	queueEnabled bool,
	featureFlags map[string]any,
	workflowRules map[string]any,
	communication map[string]any,
	billing map[string]any,
) (map[string]any, error) {
	return s.repo.UpsertOrganizationConfiguration(
		ctx,
		organizationID,
		tier,
		enabledServices,
		minStaff,
		queueEnabled,
		featureFlags,
		workflowRules,
		communication,
		billing,
	)
}

func (s *PatientPortalService) GetOrganizationServiceManagementConfiguration(ctx context.Context, organizationID string) (map[string]any, error) {
	return s.repo.GetOrganizationServiceManagementConfiguration(ctx, organizationID)
}

func (s *PatientPortalService) UpsertOrganizationServiceManagementConfiguration(
	ctx context.Context,
	organizationID,
	tier string,
	installedServices []string,
	updatedBy string,
) (map[string]any, error) {
	return s.repo.UpsertOrganizationServiceManagementConfiguration(ctx, organizationID, tier, installedServices, updatedBy)
}

func (s *PatientPortalService) ListOrganizationStaff(ctx context.Context, organizationID string, limit int) ([]map[string]any, error) {
	return s.repo.ListOrganizationStaff(ctx, organizationID, limit)
}

func (s *PatientPortalService) CreateOrganizationStaff(ctx context.Context, organizationID, fullName, email, password, role, staffTemplateKey, professionalTitle, licenseNumber string, telemedicineEnabled bool, telemedicineSpecialty string, telemedicineRate float64, telemedicineCurrency string, telemedicineModes []string) (map[string]any, error) {
	if (role == "doctor" || role == "nurse") && licenseNumber == "" {
		return nil, fmt.Errorf("license_number is required for %s", role)
	}
	authRole := "staff"
	if role == "admin" || role == "doctor" || role == "nurse" {
		authRole = role
	}
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	if len(telemedicineModes) == 0 {
		telemedicineModes = []string{"video", "voice", "chat"}
	}
	if telemedicineCurrency == "" {
		telemedicineCurrency = "ETB"
	}
	return s.repo.CreateOrganizationStaff(ctx, organizationID, fullName, email, string(hashBytes), authRole, role, staffTemplateKey, professionalTitle, licenseNumber, telemedicineEnabled, telemedicineSpecialty, telemedicineRate, telemedicineCurrency, telemedicineModes)
}

func (s *PatientPortalService) UpdateOrganizationStaff(ctx context.Context, organizationID, userID string, fullName, role, staffTemplateKey, professionalTitle, licenseNumber *string, active *bool, telemedicineEnabled *bool, telemedicineSpecialty *string, telemedicineRate *float64, telemedicineCurrency *string, telemedicineModes *[]string) (map[string]any, error) {
	var authRole *string
	var profileRole *string
	if role != nil {
		normalized := *role
		if normalized == "" {
			return nil, fmt.Errorf("role cannot be empty")
		}
		if normalized != "admin" && normalized != "doctor" && normalized != "nurse" && normalized != "staff" && normalized != "reception" && normalized != "pharmacist" && normalized != "lab" {
			return nil, fmt.Errorf("unsupported role")
		}
		profileRole = &normalized
		mapped := "staff"
		if normalized == "admin" || normalized == "doctor" || normalized == "nurse" {
			mapped = normalized
		}
		authRole = &mapped

		if (normalized == "doctor" || normalized == "nurse") && (licenseNumber == nil || *licenseNumber == "") {
			return nil, fmt.Errorf("license_number is required for %s", normalized)
		}
	}

	return s.repo.UpdateOrganizationStaff(ctx, organizationID, userID, fullName, authRole, profileRole, staffTemplateKey, professionalTitle, licenseNumber, active, telemedicineEnabled, telemedicineSpecialty, telemedicineRate, telemedicineCurrency, telemedicineModes)
}

func (s *PatientPortalService) UpdateOrganizationStaffTelemedicineProfile(ctx context.Context, organizationID, userID string, updates model.TelemedicineProfileUpdate) (map[string]any, error) {
	return s.repo.UpdateOrganizationStaffTelemedicineProfile(ctx, organizationID, userID, updates)
}


func (s *PatientPortalService) DeleteOrganizationStaff(ctx context.Context, organizationID, userID string) error {
	return s.repo.DeleteOrganizationStaff(ctx, organizationID, userID)
}

func (s *PatientPortalService) InsertOrganizationStaffAuditLog(
	ctx context.Context,
	action string,
	actorID string,
	actorEmail string,
	actorRole string,
	actorOrgID string,
	targetOrgID string,
	targetUserID string,
) error {
	return s.repo.InsertOrgStaffAuditLog(ctx, action, actorID, actorEmail, actorRole, actorOrgID, targetOrgID, targetUserID)
}

func (s *PatientPortalService) CreateOrgUser(ctx context.Context, fullName, email, password, role string) (map[string]any, error) {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}
	return s.repo.CreateOrgUser(ctx, fullName, email, string(hashBytes), role)
}

func (s *PatientPortalService) UpdateOrgUser(ctx context.Context, userID string, fullName, email *string) (map[string]any, error) {
	return s.repo.UpdateOrgUser(ctx, userID, fullName, email)
}

func (s *PatientPortalService) SetOrgUserRole(ctx context.Context, userID, role string) (map[string]any, error) {
	return s.repo.SetOrgUserRole(ctx, userID, role)
}

func (s *PatientPortalService) SetOrgUserActive(ctx context.Context, userID string, active bool) (map[string]any, error) {
	return s.repo.SetOrgUserActive(ctx, userID, active)
}

func (s *PatientPortalService) ResetOrgUserPassword(ctx context.Context, userID, password string) error {
	hashBytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	return s.repo.ResetOrgUserPassword(ctx, userID, string(hashBytes))
}

func (s *PatientPortalService) OrgSystemOverview(ctx context.Context) (map[string]any, error) {
	return s.repo.OrgSystemOverview(ctx)
}

func (s *PatientPortalService) AIRouter(ctx context.Context, patientID, mode, message string) map[string]any {
	intent := "general"

	var prompt string
	switch mode {
	case "medsafe_check":
		intent = "medication_safety"
		prompt = fmt.Sprintf(`You are a clinical pharmacist AI assistant. %s

Analyze the medication for:
1. Common drug interactions with listed conditions/medications
2. Allergy contraindications
3. Pregnancy safety category (if applicable)
4. Recommended monitoring parameters
5. Alternative options if concerns are identified

Use clinical, professional language. Keep response concise (under 250 words). Do not make definitive diagnoses — flag concerns for clinician review.`, message)

	case "clinical_knowledge_base":
		intent = "clinical_reference"
		prompt = fmt.Sprintf(`You are a clinical decision support AI. %s

Provide:
1. Relevant evidence-based clinical guidelines (mention specific guidelines e.g. WHO, NICE, CDC where applicable)
2. Standard diagnostic criteria or scoring (e.g. ICD-10, DSM-5, clinical scores)
3. First-line treatment recommendations
4. Key drug references (mention RxCUI class or generic names)
5. Red flags or referral criteria

Format as a structured summary. Keep under 300 words. Cite guideline sources where possible.`, message)

	case "triage_evaluator":
		intent = "triage_assessment"
		prompt = message // Already fully constructed by frontend

	case "diet_assistant":
		intent = "nutrition"
		prompt = fmt.Sprintf(`You are a clinical dietitian AI. %s

Provide a personalized, evidence-based nutrition guidance considering the patient's conditions. Include:
- Recommended food groups and servings
- Foods to avoid
- Hydration advice
- Any condition-specific dietary modifications

Keep practical and under 250 words.`, message)

	case "health_recommender":
		intent = "exercise_physiology"
		prompt = fmt.Sprintf(`You are a clinical exercise physiologist AI. %s

Provide safe, evidence-based physical activity recommendations considering the patient's conditions. Include:
- Safe exercise types
- Frequency, duration, and intensity targets
- Contraindicated activities to avoid
- Monitoring parameters

Keep practical and under 250 words.`, message)

	case "pharmacy":
		intent = "medication_assistant"
		prompt = fmt.Sprintf(`You are a concise healthcare assistant for a patient portal.
Mode: %s
Patient request: %s

Respond in 2-4 short paragraphs. Use clear next steps. Do not claim diagnosis certainty.
If the user is describing urgent symptoms, advise seeking immediate care.
When useful, mention medication, appointments, lab results, telemedicine, or message follow-up.`, mode, message)

	case "telemedicine":
		intent = "telemedicine_support"
		prompt = fmt.Sprintf(`You are a concise healthcare assistant for a patient portal.
Mode: %s
Patient request: %s

Respond in 2-4 short paragraphs. Use clear next steps. Do not claim diagnosis certainty.
If the user is describing urgent symptoms, advise seeking immediate care.
When useful, mention medication, appointments, lab results, telemedicine, or message follow-up.`, mode, message)

	case "care":
		intent = "care_assistant"
		prompt = fmt.Sprintf(`You are a concise healthcare assistant for a patient portal.
Mode: %s
Patient request: %s

Respond in 2-4 short paragraphs. Use clear next steps. Do not claim diagnosis certainty.
If the user is describing urgent symptoms, advise seeking immediate care.
When useful, mention medication, appointments, lab results, telemedicine, or message follow-up.`, mode, message)

	default:
		intent = "general"
		prompt = fmt.Sprintf(`You are a concise healthcare assistant for a patient portal.
Mode: %s
Patient request: %s

Respond in 2-4 short paragraphs. Use clear next steps. Do not claim diagnosis certainty.
If the user is describing urgent symptoms, advise seeking immediate care.
When useful, mention medication, appointments, lab results, telemedicine, or message follow-up.`, mode, message)
	}

	if message == "" {
		message = "How can I help you today?"
	}

	reply := "AI router is active. " + message
	if geminiText, err := s.callGemini(ctx, prompt); err == nil && strings.TrimSpace(geminiText) != "" {
		reply = strings.TrimSpace(geminiText)
	}
	return map[string]any{
		"patient_id": patientID,
		"mode":       mode,
		"intent":     intent,
		"reply":      reply,
		"skills":     []string{"symptom_checker", "medication_assistant", "diet_assistant", "appointment_scheduler", "health_recommender", "medsafe_check", "clinical_knowledge_base", "triage_evaluator"},
	}
}

// EndTelemedicineSession marks a session as completed and records ended_at.
func (s *PatientPortalService) EndTelemedicineSession(ctx context.Context, sessionID string) (*model.TelemedicineSession, error) {
	return s.repo.EndTelemedicineSession(ctx, sessionID)
}

// CancelTelemedicineSession cancels a pending session for the given patient.
func (s *PatientPortalService) CancelTelemedicineSession(ctx context.Context, sessionID, patientID string) (*model.TelemedicineSession, error) {
	return s.repo.CancelTelemedicineSession(ctx, sessionID, patientID)
}


package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type TelemedicineSummaryInput struct {
	SessionID      string
	Language       string
	Transcript     string
	DoctorNotes    string
	Symptoms       []string
	RecordingURL   *string
	TranscriptURL  *string
	DoctorID       *string
	FinalDiagnosis string
	FollowUpDays   *int
}

type TelemedicineSummaryResult struct {
	SessionID               string                             `json:"session_id"`
	SummaryEN               string                             `json:"summary_en"`
	SummaryAM               string                             `json:"summary_am"`
	FinalDiagnosis          string                             `json:"final_diagnosis"`
	Symptoms                []string                           `json:"symptoms"`
	FollowUpNeeded          bool                               `json:"follow_up_needed"`
	RecommendedFollowUpDays int                                `json:"recommended_follow_up_days"`
	Language                string                             `json:"language"`
	Artifact                *model.TelemedicineSessionArtifact `json:"artifact,omitempty"`
	LearningSample          *model.AILearningSample            `json:"learning_sample,omitempty"`
	FollowUpAppointment     *model.Appointment                 `json:"follow_up_appointment,omitempty"`
	LiveKitRoom             string                             `json:"livekit_room,omitempty"`
	LiveKitToken            string                             `json:"livekit_token,omitempty"`
	LiveKitURL              string                             `json:"livekit_url,omitempty"`
}

type telemedicineSummaryPayload struct {
	SummaryEN               string   `json:"summary_en"`
	SummaryAM               string   `json:"summary_am"`
	FinalDiagnosis          string   `json:"final_diagnosis"`
	Symptoms                []string `json:"symptoms"`
	FollowUpNeeded          bool     `json:"follow_up_needed"`
	RecommendedFollowUpDays int      `json:"recommended_follow_up_days"`
	FollowUpReason          string   `json:"follow_up_reason"`
	DoctorInstructionsEN    string   `json:"doctor_instructions_en"`
	DoctorInstructionsAM    string   `json:"doctor_instructions_am"`
}

func (s *PatientPortalService) GetTelemedicineSessionByID(ctx context.Context, id string) (*model.TelemedicineSession, error) {
	return s.repo.GetTelemedicineSessionByID(ctx, id)
}

func (s *PatientPortalService) CreateTelemedicineArtifact(ctx context.Context, sessionID, patientID string, doctorID, recordingURL, transcriptURL *string, summary, finalDiagnosis string, symptoms []string, followUpNeeded bool) (*model.TelemedicineSessionArtifact, error) {
	return s.repo.CreateTelemedicineArtifact(ctx, sessionID, patientID, doctorID, recordingURL, transcriptURL, summary, finalDiagnosis, symptoms, followUpNeeded)
}

func (s *PatientPortalService) SummarizeTelemedicineSession(ctx context.Context, patientID string, input TelemedicineSummaryInput) (*TelemedicineSummaryResult, error) {
	if input.SessionID == "" {
		return nil, errors.New("session_id is required")
	}
	session, err := s.repo.GetTelemedicineSessionByID(ctx, input.SessionID)
	if err != nil {
		return nil, err
	}
	if session.PatientID != patientID {
		return nil, repository.ErrNotFound
	}
	consent, err := s.repo.GetAIConsentByPatient(ctx, patientID)
	if err != nil {
		return nil, err
	}
	if !consent.AllowSummaries {
		return nil, errors.New("summaries consent is disabled")
	}
	lang := strings.ToLower(strings.TrimSpace(input.Language))
	if lang != "am" {
		lang = "en"
	}
	prompt := buildTelemedicineSummaryPrompt(session, input, lang)
	geminiText, err := s.callGemini(ctx, prompt)
	if err != nil || strings.TrimSpace(geminiText) == "" {
		geminiText = buildFallbackTelemedicineSummary(session, input, lang)
	}
	parsed := parseTelemedicineSummary(geminiText, session, input, lang)
	summaryText := bilingualSummary(parsed.SummaryEN, parsed.SummaryAM, lang)
	artifact, err := s.repo.CreateTelemedicineArtifact(ctx, input.SessionID, patientID, input.DoctorID, input.RecordingURL, input.TranscriptURL, summaryText, parsed.FinalDiagnosis, parsed.Symptoms, parsed.FollowUpNeeded)
	if err != nil {
		return nil, err
	}
	result := &TelemedicineSummaryResult{
		SessionID:               input.SessionID,
		SummaryEN:               parsed.SummaryEN,
		SummaryAM:               parsed.SummaryAM,
		FinalDiagnosis:          parsed.FinalDiagnosis,
		Symptoms:                parsed.Symptoms,
		FollowUpNeeded:          parsed.FollowUpNeeded,
		RecommendedFollowUpDays: parsed.RecommendedFollowUpDays,
		Language:                lang,
		Artifact:                artifact,
	}
	if consent.AllowLearning {
		sample, sampleErr := s.repo.InsertAILearningSample(ctx, patientID, "telemedicine", "session_summary", map[string]any{
			"session_id":                 input.SessionID,
			"language":                   lang,
			"summary_en":                 parsed.SummaryEN,
			"summary_am":                 parsed.SummaryAM,
			"final_diagnosis":            parsed.FinalDiagnosis,
			"symptoms":                   parsed.Symptoms,
			"follow_up_needed":           parsed.FollowUpNeeded,
			"recommended_follow_up_days": parsed.RecommendedFollowUpDays,
			"recording_url":              input.RecordingURL,
			"transcript_url":             input.TranscriptURL,
			"doctor_notes":               input.DoctorNotes,
		}, true)
		if sampleErr == nil {
			result.LearningSample = sample
		}
	}
	return result, nil
}

func (s *PatientPortalService) GenerateLiveKitSessionToken(subjectID, roomName, displayName, role string) (string, error) {
	if s.cfg == nil || s.cfg.LiveKitAPIKey == "" || s.cfg.LiveKitAPISecret == "" || s.cfg.LiveKitURL == "" {
		return "", errors.New("livekit is not configured")
	}
	if roomName == "" {
		return "", errors.New("room_name is required")
	}
	if subjectID == "" {
		return "", errors.New("identity is required")
	}
	claims := jwt.MapClaims{
		"iss":  s.cfg.LiveKitAPIKey,
		"sub":  subjectID,
		"nbf":  time.Now().UTC().Add(-30 * time.Second).Unix(),
		"exp":  time.Now().UTC().Add(2 * time.Hour).Unix(),
		"jti":  fmt.Sprintf("%s-%d", subjectID, time.Now().UnixNano()),
		"name": displayName,
		// LiveKit expects metadata to be a string, not an object.
		"metadata": fmt.Sprintf(`{"role":"%s"}`, role),
		"video": map[string]any{
			"roomJoin":             true,
			"room":                 roomName,
			"canPublish":           true,
			"canSubscribe":         true,
			"canPublishData":       true,
			"canUpdateOwnMetadata": true,
			"canUpdateMetadata":    true,
			"roomAdmin":            role == "org" || role == "doctor",
			"participantName":      displayName,
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.LiveKitAPISecret))
}

func (s *PatientPortalService) GenerateLiveKitRoomName(sessionID string) string {
	if sessionID == "" {
		return "telemedicine-room"
	}
	return "telemedicine-" + sessionID
}

func (s *PatientPortalService) callGemini(ctx context.Context, prompt string) (string, error) {
	if s.cfg == nil || s.cfg.GeminiAPIKey == "" {
		return "", errors.New("gemini is not configured")
	}
	modelName := s.cfg.GeminiModel
	if modelName == "" {
		modelName = "gemini-1.5-flash"
	}
	reqBody := map[string]any{
		"contents": []map[string]any{{
			"role":  "user",
			"parts": []map[string]any{{"text": prompt}},
		}},
		"generationConfig": map[string]any{
			"temperature":      0.2,
			"responseMimeType": "application/json",
		},
	}
	body, _ := json.Marshal(reqBody)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", modelName, s.cfg.GeminiAPIKey), bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	respBody, _ := io.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("gemini request failed: %s", strings.TrimSpace(string(respBody)))
	}
	var decoded struct {
		Candidates []struct {
			Content struct {
				Parts []struct {
					Text string `json:"text"`
				} `json:"parts"`
			} `json:"content"`
		} `json:"candidates"`
	}
	if err := json.Unmarshal(respBody, &decoded); err != nil {
		return "", err
	}
	for _, candidate := range decoded.Candidates {
		for _, part := range candidate.Content.Parts {
			if strings.TrimSpace(part.Text) != "" {
				return part.Text, nil
			}
		}
	}
	return "", errors.New("gemini returned an empty response")
}

func buildTelemedicineSummaryPrompt(session *model.TelemedicineSession, input TelemedicineSummaryInput, lang string) string {
	langLabel := "English and Amharic"
	if lang == "am" {
		langLabel = "Amharic and English"
	}
	return fmt.Sprintf(`You are a bilingual telemedicine clinical summarizer.
Return JSON only with keys: summary_en, summary_am, final_diagnosis, symptoms, follow_up_needed, recommended_follow_up_days, follow_up_reason, doctor_instructions_en, doctor_instructions_am.
Write concise, clinically useful output in %s.
Session doctor: %s.
Scheduled time: %s.
Patient transcript: %s
Doctor notes: %s
Symptoms: %s
Existing diagnosis hint: %s
Prefer direct language, mention if the case needs follow-up, and avoid unsupported certainty.`, langLabel, session.DoctorName, session.ScheduledAt.Format(time.RFC3339), input.Transcript, input.DoctorNotes, strings.Join(input.Symptoms, ", "), input.FinalDiagnosis)
}

func buildFallbackTelemedicineSummary(session *model.TelemedicineSession, input TelemedicineSummaryInput, lang string) string {
	payload := telemedicineSummaryPayload{
		SummaryEN:               fmt.Sprintf("Telemedicine follow-up for %s with %s. Notes: %s", session.PatientID, session.DoctorName, truncateText(input.DoctorNotes, 180)),
		SummaryAM:               fmt.Sprintf("የቴሌሜዲሲን ክትትል ለ%s ከ%s ጋር። ማስታወሻዎች: %s", session.PatientID, session.DoctorName, truncateText(input.DoctorNotes, 120)),
		FinalDiagnosis:          firstNonEmpty(input.FinalDiagnosis, "needs_clinical_review"),
		Symptoms:                dedupeStrings(input.Symptoms),
		FollowUpNeeded:          true,
		RecommendedFollowUpDays: firstPositive(input.FollowUpDays, 7),
		FollowUpReason:          "clinical_review_required",
		DoctorInstructionsEN:    "Review the session notes and patient-reported symptoms.",
		DoctorInstructionsAM:    "የክፍለ-ጊዜውን ማስታወሻ እና የታካሚውን ምልክቶች ይመልከቱ።",
	}
	if lang == "am" {
		payload.SummaryAM = payload.SummaryAM + " ከሚቀጥለው ቀጠሮ ጋር ይከታተሉ።"
	}
	data, _ := json.Marshal(payload)
	return string(data)
}

func parseTelemedicineSummary(raw string, session *model.TelemedicineSession, input TelemedicineSummaryInput, lang string) telemedicineSummaryPayload {
	var payload telemedicineSummaryPayload
	if err := json.Unmarshal([]byte(raw), &payload); err == nil && (payload.SummaryEN != "" || payload.SummaryAM != "") {
		payload.Symptoms = dedupeStrings(payload.Symptoms)
		if payload.FinalDiagnosis == "" {
			payload.FinalDiagnosis = firstNonEmpty(input.FinalDiagnosis, "needs_clinical_review")
		}
		if payload.RecommendedFollowUpDays <= 0 {
			payload.RecommendedFollowUpDays = firstPositive(input.FollowUpDays, 7)
		}
		if payload.SummaryEN == "" {
			payload.SummaryEN = firstNonEmpty(payload.SummaryAM, raw)
		}
		if payload.SummaryAM == "" {
			payload.SummaryAM = firstNonEmpty(payload.SummaryEN, raw)
		}
		return payload
	}
	payload = telemedicineSummaryPayload{
		SummaryEN:               fmt.Sprintf("Session with %s was summarized successfully.", session.DoctorName),
		SummaryAM:               fmt.Sprintf("ከ%s ጋር ያለው ክፍለ-ጊዜ በተሳካ ሁኔታ ተጠቃለለ።", session.DoctorName),
		FinalDiagnosis:          firstNonEmpty(input.FinalDiagnosis, "needs_clinical_review"),
		Symptoms:                dedupeStrings(input.Symptoms),
		FollowUpNeeded:          len(input.Symptoms) > 0,
		RecommendedFollowUpDays: firstPositive(input.FollowUpDays, 7),
		FollowUpReason:          "generated_from_session_notes",
		DoctorInstructionsEN:    "Review the patient symptoms and session notes.",
		DoctorInstructionsAM:    "የታካሚውን ምልክቶች እና የክፍለ-ጊዜ ማስታወሻዎች ይመልከቱ።",
	}
	if lang == "am" {
		payload.SummaryAM = payload.SummaryAM + " በAmharic የተዘጋጀ ማጠቃለያ።"
	}
	return payload
}

func bilingualSummary(en, am, lang string) string {
	if lang == "am" {
		return strings.TrimSpace("Amharic: " + am + "\nEnglish: " + en)
	}
	return strings.TrimSpace("English: " + en + "\nAmharic: " + am)
}

func truncateText(value string, max int) string {
	value = strings.TrimSpace(value)
	if len(value) <= max {
		return value
	}
	return value[:max] + "..."
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return strings.TrimSpace(value)
		}
	}
	return ""
}

func firstPositive(value *int, fallback int) int {
	if value != nil && *value > 0 {
		return *value
	}
	return fallback
}

func dedupeStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	out := make([]string, 0, len(values))
	for _, value := range values {
		trimmed := strings.TrimSpace(value)
		if trimmed == "" {
			continue
		}
		key := strings.ToLower(trimmed)
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, trimmed)
	}
	return out
}

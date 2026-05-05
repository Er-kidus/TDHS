package handler

import (
	"net/http"
	"strconv"
	"time"
)

func parseLimit(r *http.Request, fallback int) int {
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	if limit <= 0 {
		return fallback
	}
	return limit
}

func (h *Handler) ListDoctors(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListDoctors(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list doctors")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListPrescriptions(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListPrescriptions(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list prescriptions")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListLabResults(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListLabResults(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list lab results")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListInvoices(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListInvoices(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list invoices")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) GetInsurance(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.PatientPortal.GetInsurance(r.Context(), subjectID(r.Context()))
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to get insurance")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type createMessageRequest struct {
	Sender        string  `json:"sender"`
	Channel       string  `json:"channel"`
	Content       string  `json:"content"`
	AttachmentURL *string `json:"attachment_url"`
}

func (h *Handler) ListMessages(w http.ResponseWriter, r *http.Request) {
	limit := parseLimit(r, 50)
	channel := r.URL.Query().Get("channel")
	var items any
	var err error
	if channel != "" {
		items, err = h.svcs.PatientPortal.ListMessagesByChannel(r.Context(), channel, limit)
	} else {
		items, err = h.svcs.PatientPortal.ListMessages(r.Context(), subjectID(r.Context()), limit)
	}
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list messages")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateMessage(w http.ResponseWriter, r *http.Request) {
	var req createMessageRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Sender == "" {
		req.Sender = "Patient"
	}
	if req.Channel == "" {
		req.Channel = "doctor"
	}
	if req.Content == "" {
		h.errorJSON(w, http.StatusBadRequest, "content is required")
		return
	}
	item, err := h.svcs.PatientPortal.CreateMessage(r.Context(), subjectID(r.Context()), req.Sender, req.Channel, req.Content, req.AttachmentURL)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create message")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

type createDocumentRequest struct {
	Name     string  `json:"name"`
	Category string  `json:"category"`
	URL      *string `json:"url"`
}

func (h *Handler) ListDocuments(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListDocuments(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list documents")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateDocument(w http.ResponseWriter, r *http.Request) {
	var req createDocumentRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" {
		h.errorJSON(w, http.StatusBadRequest, "name is required")
		return
	}
	if req.Category == "" {
		req.Category = "report"
	}
	item, err := h.svcs.PatientPortal.CreateDocument(r.Context(), subjectID(r.Context()), req.Name, req.Category, req.URL)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create document")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

type createTelemedicineSessionRequest struct {
	DoctorID          *string `json:"doctor_id"`
	DoctorName        string  `json:"doctor_name"`
	ScheduledAt       string  `json:"scheduled_at"`
	PreferredMode     string  `json:"preferred_mode"`
	RequestedAmount   float64 `json:"requested_amount"`
	RequestedCurrency string  `json:"requested_currency"`
	Notes             *string `json:"notes"`
}

func (h *Handler) ListTelemedicineSessions(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListTelemedicineSessions(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list telemedicine sessions")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) CreateTelemedicineSession(w http.ResponseWriter, r *http.Request) {
	var req createTelemedicineSessionRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.DoctorName == "" || req.ScheduledAt == "" {
		h.errorJSON(w, http.StatusBadRequest, "doctor_name and scheduled_at are required")
		return
	}
	if req.PreferredMode == "" {
		req.PreferredMode = "video"
	}
	if req.PreferredMode != "video" && req.PreferredMode != "voice" && req.PreferredMode != "chat" {
		h.errorJSON(w, http.StatusBadRequest, "preferred_mode must be one of: video, voice, chat")
		return
	}
	if req.RequestedCurrency == "" {
		req.RequestedCurrency = "ETB"
	}
	when, err := time.Parse(time.RFC3339, req.ScheduledAt)
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, "scheduled_at must be RFC3339")
		return
	}
	item, err := h.svcs.PatientPortal.CreateTelemedicineSession(r.Context(), subjectID(r.Context()), req.DoctorID, req.DoctorName, when, req.PreferredMode, req.RequestedAmount, req.RequestedCurrency, req.Notes)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create telemedicine session")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) ListPharmacyMedications(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListPharmacyMedications(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list medications")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListPharmacies(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListPharmacies(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list pharmacies")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListPharmacyOrders(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListPharmacyOrders(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list orders")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type createPharmacyOrderRequest struct {
	MedicationID *string `json:"medication_id"`
	Quantity     int     `json:"quantity"`
	TotalAmount  float64 `json:"total_amount"`
	Currency     string  `json:"currency"`
	DeliveryMode string  `json:"delivery_mode"`
}

func (h *Handler) CreatePharmacyOrder(w http.ResponseWriter, r *http.Request) {
	var req createPharmacyOrderRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Quantity <= 0 {
		req.Quantity = 1
	}
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if req.DeliveryMode == "" {
		req.DeliveryMode = "delivery"
	}
	item, err := h.svcs.PatientPortal.CreatePharmacyOrder(r.Context(), subjectID(r.Context()), req.MedicationID, req.Quantity, req.TotalAmount, req.Currency, req.DeliveryMode)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create order")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

type aiRouterRequest struct {
	Mode    string `json:"mode"`
	Message string `json:"message"`
}

func (h *Handler) AIRouter(w http.ResponseWriter, r *http.Request) {
	var req aiRouterRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Mode == "" {
		req.Mode = "care"
	}
	resp := h.svcs.PatientPortal.AIRouter(r.Context(), subjectID(r.Context()), req.Mode, req.Message)
	h.writeJSON(w, http.StatusOK, resp)
}

func (h *Handler) ListChronicCare(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListChronicCare(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list chronic care records")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListPregnancyCare(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListPregnancyCare(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list pregnancy records")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) ListRecurrentMedications(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListRecurrentMedications(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list recurrent medication records")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) GetAIConsent(w http.ResponseWriter, r *http.Request) {
	item, err := h.svcs.PatientPortal.GetAIConsent(r.Context(), subjectID(r.Context()))
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to get consent")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type upsertAIConsentRequest struct {
	AllowLearning  bool `json:"allow_learning"`
	AllowSummaries bool `json:"allow_summaries"`
	AllowAnalytics bool `json:"allow_analytics"`
}

func (h *Handler) UpsertAIConsent(w http.ResponseWriter, r *http.Request) {
	var req upsertAIConsentRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	item, err := h.svcs.PatientPortal.UpsertAIConsent(r.Context(), subjectID(r.Context()), req.AllowLearning, req.AllowSummaries, req.AllowAnalytics, subjectID(r.Context()))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save consent")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

func (h *Handler) ListAIModels(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListAIModels(r.Context())
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list ai models")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type setAIModelStatusRequest struct {
	ModelKey string `json:"model_key"`
	Status   string `json:"status"`
}

func (h *Handler) SetAIModelStatus(w http.ResponseWriter, r *http.Request) {
	var req setAIModelStatusRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.ModelKey == "" || req.Status == "" {
		h.errorJSON(w, http.StatusBadRequest, "model_key and status are required")
		return
	}
	item, err := h.svcs.PatientPortal.SetAIModelStatus(r.Context(), req.ModelKey, req.Status)
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to update ai model status")
		return
	}
	h.writeJSON(w, http.StatusOK, item)
}

type createAILearningSampleRequest struct {
	Mode       string         `json:"mode"`
	SampleType string         `json:"sample_type"`
	Payload    map[string]any `json:"payload"`
}

func (h *Handler) CreateAILearningSample(w http.ResponseWriter, r *http.Request) {
	var req createAILearningSampleRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Mode == "" || req.SampleType == "" {
		h.errorJSON(w, http.StatusBadRequest, "mode and sample_type are required")
		return
	}
	consent, err := h.svcs.PatientPortal.GetAIConsent(r.Context(), subjectID(r.Context()))
	if err != nil {
		if mapRepoErr(h, w, err) {
			return
		}
		h.errorJSON(w, http.StatusInternalServerError, "failed to validate consent")
		return
	}
	if !consent.AllowLearning {
		h.errorJSON(w, http.StatusForbidden, "learning consent is disabled")
		return
	}
	item, err := h.svcs.PatientPortal.InsertAILearningSample(r.Context(), subjectID(r.Context()), req.Mode, req.SampleType, req.Payload, true)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to save learning sample")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) ListTelemedicineArtifacts(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListTelemedicineArtifactsByPatient(r.Context(), subjectID(r.Context()), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list session artifacts")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListTelemedicineArtifacts(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListTelemedicineArtifactsForOrg(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list telemedicine artifacts")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

func (h *Handler) OrgListDoctors(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListOrgDoctors(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list doctors")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type createOrgDoctorRequest struct {
	FullName      string `json:"full_name"`
	Email         string `json:"email"`
	Specialty     string `json:"specialty"`
	LicenseNumber string `json:"license_number"`
}

func (h *Handler) OrgCreateDoctor(w http.ResponseWriter, r *http.Request) {
	var req createOrgDoctorRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.FullName == "" || req.Email == "" || req.Specialty == "" || req.LicenseNumber == "" {
		h.errorJSON(w, http.StatusBadRequest, "full_name, email, specialty, and license_number are required")
		return
	}
	item, err := h.svcs.PatientPortal.CreateOrgDoctor(r.Context(), req.FullName, req.Email, req.Specialty, req.LicenseNumber)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create doctor")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

func (h *Handler) OrgListPharmacies(w http.ResponseWriter, r *http.Request) {
	items, err := h.svcs.PatientPortal.ListOrgPharmacies(r.Context(), parseLimit(r, 50))
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list pharmacies")
		return
	}
	h.writeJSON(w, http.StatusOK, items)
}

type createOrgPharmacyRequest struct {
	Name     string `json:"name"`
	Location string `json:"location"`
}

func (h *Handler) OrgCreatePharmacy(w http.ResponseWriter, r *http.Request) {
	var req createOrgPharmacyRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	if req.Name == "" || req.Location == "" {
		h.errorJSON(w, http.StatusBadRequest, "name and location are required")
		return
	}
	item, err := h.svcs.PatientPortal.CreateOrgPharmacy(r.Context(), req.Name, req.Location)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to create pharmacy")
		return
	}
	h.writeJSON(w, http.StatusCreated, item)
}

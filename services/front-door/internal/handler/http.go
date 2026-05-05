package handler

import (
	"encoding/json"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/Er-kidus/Tenadam/services/front-door/internal/model"
	"github.com/Er-kidus/Tenadam/services/front-door/internal/service"
)

type Handler struct {
	registry service.RegistryClient
	workflow *service.WorkflowStore
}

func New(registry service.RegistryClient) Handler {
	return Handler{registry: registry, workflow: service.NewWorkflowStore()}
}

func (h Handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/healthz", withCORS(h.health))
	mux.HandleFunc("/metadata", withCORS(h.metadata))
	mux.HandleFunc("/v1/frontdoor/lookup/patients", withCORS(h.lookupPatients))
	mux.HandleFunc("/v1/frontdoor/lookup/organizations", withCORS(h.lookupOrganizations))
	mux.HandleFunc("/v1/frontdoor/lookup/practitioners", withCORS(h.lookupPractitioners))
	mux.HandleFunc("/v1/frontdoor/appointments", withCORS(h.appointmentsRoutes))
	mux.HandleFunc("/v1/frontdoor/appointments/cancel", withCORS(h.cancelAppointment))
	mux.HandleFunc("/v1/frontdoor/appointments/reschedule", withCORS(h.rescheduleAppointment))
	mux.HandleFunc("/v1/frontdoor/appointments/arrive", withCORS(h.arriveAppointment))
	mux.HandleFunc("/v1/frontdoor/appointments/complete", withCORS(h.completeAppointment))
	mux.HandleFunc("/v1/frontdoor/appointments/no-show", withCORS(h.noShowAppointment))
	mux.HandleFunc("/v1/frontdoor/slots", withCORS(h.slotsRoutes))
	mux.HandleFunc("/v1/frontdoor/queue/entries", withCORS(h.queueRoutes))
	mux.HandleFunc("/v1/frontdoor/checkins", withCORS(h.checkIn))
	mux.HandleFunc("/v1/frontdoor/queue/advance", withCORS(h.advanceQueue))
	mux.HandleFunc("/v1/frontdoor/queue/complete", withCORS(h.completeQueue))
	mux.HandleFunc("/v1/frontdoor/triage/assess", withCORS(h.assessTriage))
	mux.HandleFunc("/v1/frontdoor/triage/assessments", withCORS(h.triageAssessmentsRoutes))
	mux.HandleFunc("/v1/frontdoor/triage/assessments/", withCORS(h.getTriageAssessment))
	mux.HandleFunc("/v1/frontdoor/triage/model/status", withCORS(h.triageModelStatus))
	mux.HandleFunc("/v1/frontdoor/triage/model/activate", withCORS(h.activateTriageModel))
	mux.HandleFunc("/v1/frontdoor/triage/model/rollback", withCORS(h.rollbackTriageModel))
	mux.HandleFunc("/v1/frontdoor/fhir/", withCORS(h.getFHIRResource))
}

func (h Handler) metadata(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeFHIRError(w, http.StatusMethodNotAllowed, "not-supported", "method not allowed")
		return
	}

	writeFHIRJSON(w, http.StatusOK, map[string]any{
		"resourceType": "CapabilityStatement",
		"status":       "active",
		"kind":         "instance",
		"fhirVersion":  "4.0.1",
		"format":       []string{"json", "application/fhir+json"},
		"software": map[string]any{
			"name": "tenadam-front-door",
		},
		"rest": []map[string]any{{
			"mode": "server",
			"resource": []map[string]any{
				{"type": "Appointment"},
				{"type": "Slot"},
				{"type": "Task"},
				{"type": "Observation"},
			},
		}},
	})
}

func (h Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (h Handler) lookupPatients(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	limit, offset := parsePaging(r)
	data, err := h.registry.SearchPatients(r.URL.Query().Get("q"), limit, offset, r.URL.Query().Get("sort"))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, data)
}

func (h Handler) lookupOrganizations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	limit, offset := parsePaging(r)
	data, err := h.registry.SearchOrganizations(r.URL.Query().Get("q"), limit, offset, r.URL.Query().Get("sort"))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, data)
}

func (h Handler) lookupPractitioners(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	limit, offset := parsePaging(r)
	data, err := h.registry.SearchPractitioners(r.URL.Query().Get("q"), limit, offset, r.URL.Query().Get("sort"))
	if err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, data)
}

func (h Handler) appointmentsRoutes(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		h.listAppointments(w, r)
		return
	}
	h.createAppointment(w, r)
}

func (h Handler) createAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.CreateAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.CreateAppointment(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, appointment)
}

func (h Handler) listAppointments(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	limit, offset := parsePaging(r)
	items := h.workflow.ListAppointments(model.ListQuery{Query: r.URL.Query().Get("q"), Limit: limit + 1, Offset: offset, Sort: r.URL.Query().Get("sort")})
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}
	writeJSON(w, http.StatusOK, listEnvelope(items, limit, offset, hasMore))
}

func (h Handler) cancelAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.CancelAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.CancelAppointment(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, appointment)
}

func (h Handler) rescheduleAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.RescheduleAppointmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.RescheduleAppointment(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, appointment)
}

func (h Handler) arriveAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.AppointmentActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.MarkAppointmentArrived(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, appointment)
}

func (h Handler) completeAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.AppointmentActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.CompleteAppointment(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, appointment)
}

func (h Handler) noShowAppointment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.AppointmentActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	appointment, err := h.workflow.MarkAppointmentNoShow(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, appointment)
}

func (h Handler) slotsRoutes(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		h.listSlots(w, r)
		return
	}
	h.createSlot(w, r)
}

func (h Handler) createSlot(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.CreateSlotRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	slot, err := h.workflow.CreateSlot(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, slot)
}

func (h Handler) listSlots(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	limit, offset := parsePaging(r)
	items := h.workflow.ListSlots(model.ListQuery{Query: r.URL.Query().Get("q"), Limit: limit + 1, Offset: offset, Sort: r.URL.Query().Get("sort")})
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}
	writeJSON(w, http.StatusOK, listEnvelope(items, limit, offset, hasMore))
}

func (h Handler) queueRoutes(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodGet {
		h.listQueue(w, r)
		return
	}
	h.enqueue(w, r)
}

func (h Handler) enqueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.EnqueueRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	entry, err := h.workflow.Enqueue(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusCreated, entry)
}

func (h Handler) listQueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	limit, offset := parsePaging(r)
	items := h.workflow.ListQueue(model.ListQuery{Query: r.URL.Query().Get("q"), Limit: limit + 1, Offset: offset, Sort: r.URL.Query().Get("sort")})
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}
	writeJSON(w, http.StatusOK, listEnvelope(items, limit, offset, hasMore))
}

func (h Handler) checkIn(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.CheckInRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	entry, err := h.workflow.CheckIn(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, entry)
}

func (h Handler) advanceQueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.QueueActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	entry, err := h.workflow.AdvanceQueue(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, entry)
}

func (h Handler) completeQueue(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.QueueActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	entry, err := h.workflow.CompleteQueue(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, entry)
}

func (h Handler) assessTriage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req model.TriageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	assessment, err := h.workflow.AssessTriage(req)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, assessment)
}

func (h Handler) triageAssessmentsRoutes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	limit, offset := parsePaging(r)
	items := h.workflow.ListTriageAssessments(model.ListQuery{Query: r.URL.Query().Get("q"), Limit: limit + 1, Offset: offset, Sort: r.URL.Query().Get("sort")})
	hasMore := len(items) > limit
	if hasMore {
		items = items[:limit]
	}

	writeJSON(w, http.StatusOK, listEnvelope(items, limit, offset, hasMore))
}

func (h Handler) getTriageAssessment(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/v1/frontdoor/triage/assessments/")
	id = strings.TrimSpace(id)
	if id == "" || strings.Contains(id, "/") {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "assessment id is required"})
		return
	}

	assessment, ok := h.workflow.GetTriageAssessment(id)
	if !ok {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "triage assessment not found"})
		return
	}

	writeJSON(w, http.StatusOK, assessment)
}

func (h Handler) triageModelStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !authorizeModelAdmin(w, r) {
		return
	}

	writeJSON(w, http.StatusOK, h.workflow.TriageModelStatus())
}

func (h Handler) activateTriageModel(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !authorizeModelAdmin(w, r) {
		return
	}

	var req model.ActivateTriageModelRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
		return
	}

	status, err := h.workflow.ActivateTriageModel(req, model.TriageModelActionMetadata{
		Actor:  triageModelActorFromRequest(r),
		Reason: req.Reason,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, status)
}

func (h Handler) rollbackTriageModel(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if !authorizeModelAdmin(w, r) {
		return
	}

	var req model.RollbackTriageModelRequest
	if r.ContentLength > 0 {
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid json"})
			return
		}
	}

	status, err := h.workflow.RollbackTriageModel(model.TriageModelActionMetadata{
		Actor:  triageModelActorFromRequest(r),
		Reason: req.Reason,
	})
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}

	writeJSON(w, http.StatusOK, status)
}

func (h Handler) getFHIRResource(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeFHIRError(w, http.StatusMethodNotAllowed, "not-supported", "method not allowed")
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/v1/frontdoor/fhir/")
	parts := strings.Split(path, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		writeFHIRError(w, http.StatusBadRequest, "invalid", "resourceType and logicalId are required")
		return
	}

	resource, ok := h.workflow.FindFHIRResource(parts[0], parts[1])
	if !ok {
		writeFHIRError(w, http.StatusNotFound, "not-found", "fhir resource not found")
		return
	}

	writeFHIRJSON(w, http.StatusOK, resource)
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeFHIRJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/fhir+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func writeFHIRError(w http.ResponseWriter, status int, code, message string) {
	w.Header().Set("Content-Type", "application/fhir+json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(map[string]any{
		"resourceType": "OperationOutcome",
		"issue": []map[string]any{
			{
				"severity": "error",
				"code":     code,
				"details": map[string]string{
					"text": message,
				},
			},
		},
	})
}

func parsePaging(r *http.Request) (int, int) {
	limit := 20
	offset := 0
	if s := r.URL.Query().Get("limit"); s != "" {
		if v, err := strconv.Atoi(s); err == nil {
			if v > 0 && v <= 200 {
				limit = v
			}
		}
	}
	if s := r.URL.Query().Get("offset"); s != "" {
		if v, err := strconv.Atoi(s); err == nil && v >= 0 {
			offset = v
		}
	}
	return limit, offset
}

func listEnvelope[T any](items []T, limit, offset int, hasMore bool) map[string]any {
	return map[string]any{
		"items": items,
		"pagination": map[string]any{
			"limit":      limit,
			"offset":     offset,
			"returned":   len(items),
			"hasMore":    hasMore,
			"nextOffset": nextOffset(offset, limit, hasMore),
		},
	}
}

func nextOffset(offset, limit int, hasMore bool) any {
	if !hasMore {
		return nil
	}
	return offset + limit
}

func authorizeModelAdmin(w http.ResponseWriter, r *http.Request) bool {
	requiredRole := strings.TrimSpace(os.Getenv("TRIAGE_MODEL_ADMIN_ROLE"))
	if requiredRole == "" {
		requiredRole = "admin"
	}

	role := strings.TrimSpace(r.Header.Get("X-Frontdoor-Role"))
	if !strings.EqualFold(role, requiredRole) {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "model admin role required"})
		return false
	}

	requiredToken := strings.TrimSpace(os.Getenv("TRIAGE_MODEL_ADMIN_TOKEN"))
	if requiredToken == "" {
		return true
	}

	provided := strings.TrimSpace(r.Header.Get("X-Model-Admin-Token"))
	if provided == "" {
		auth := strings.TrimSpace(r.Header.Get("Authorization"))
		if strings.HasPrefix(strings.ToLower(auth), "bearer ") {
			provided = strings.TrimSpace(auth[7:])
		}
	}

	if provided != requiredToken {
		writeJSON(w, http.StatusForbidden, map[string]string{"error": "model admin token required"})
		return false
	}

	return true
}

func triageModelActorFromRequest(r *http.Request) string {
	if actor := strings.TrimSpace(r.Header.Get("X-Actor-Id")); actor != "" {
		return actor
	}
	if actor := strings.TrimSpace(r.Header.Get("X-User-Id")); actor != "" {
		return actor
	}
	return "unknown"
}

func withCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Frontdoor-Role, X-Actor-Id, X-User-Id, X-Model-Admin-Token")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

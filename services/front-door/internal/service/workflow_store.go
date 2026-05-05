package service

import (
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/Er-kidus/Tenadam/services/front-door/internal/model"
)

type WorkflowStore struct {
	mu                    sync.RWMutex
	appointments          map[string]model.Appointment
	appointmentSearchBlob map[string]string
	appointmentTrigram    map[string]map[string]struct{}
	slots                 map[string]model.Slot
	slotSearchBlob        map[string]string
	slotTrigram           map[string]map[string]struct{}
	queueEntries          map[string]model.QueueEntry
	queueSearchBlob       map[string]string
	queueTrigram          map[string]map[string]struct{}
	triageAssessments     map[string]model.TriageAssessment
	fhirResources         map[string]map[string]any
	triageScorer          TriageScorer
	triageDB              *sql.DB
	triageModelStatus     model.TriageModelStatus
	triageModelHistory    []model.TriageModelStatus
	triageRegistryPath    string
	triageAssessmentsPath string
}

func NewWorkflowStore() *WorkflowStore {
	scorer := newTriageScorerFromEnv()
	registryPath := triageModelRegistryPathFromEnv()
	triageAssessmentsPath := triageAssessmentsPathFromEnv()
	triagePostgresDSN := triagePostgresDSNFromEnv()

	status := model.TriageModelStatus{Enabled: false}
	if scorer != nil {
		status = model.TriageModelStatus{
			Enabled:         true,
			ModelVersion:    strings.TrimSpace(os.Getenv("TRIAGE_AI_MODEL_VERSION")),
			ScorerBaseURL:   strings.TrimSpace(os.Getenv("TRIAGE_AI_SCORER_URL")),
			TimeoutMS:       readTimeoutMSFromEnv(1500),
			LastActivatedAt: time.Now().UTC().Format(time.RFC3339),
		}
		if status.ModelVersion == "" {
			status.ModelVersion = "env-configured"
		}
	}

	history := []model.TriageModelStatus{}
	if persistedStatus, persistedHistory, err := loadTriageModelRegistry(registryPath); err == nil {
		status = persistedStatus
		history = persistedHistory
		if status.Enabled && strings.TrimSpace(status.ScorerBaseURL) != "" {
			timeout := time.Duration(status.TimeoutMS) * time.Millisecond
			if timeout <= 0 {
				timeout = 1500 * time.Millisecond
			}
			scorer = newTriageScorerWithConfig(status.ScorerBaseURL, timeout)
		} else {
			scorer = nil
		}
	} else if !errors.Is(err, fs.ErrNotExist) {
		// Keep startup resilient when the registry file is corrupted or unreadable.
		fmt.Fprintf(os.Stderr, "warning: failed to load triage model registry %q: %v\n", registryPath, err)
	}

	var triageDB *sql.DB
	if triagePostgresDSN != "" {
		if db, err := initTriagePostgresStore(triagePostgresDSN); err == nil {
			triageDB = db
		} else {
			fmt.Fprintf(os.Stderr, "warning: failed to initialize triage postgres store: %v; using file store fallback\n", err)
		}
	}

	persistedAssessments := map[string]model.TriageAssessment{}
	if triageDB == nil {
		if loaded, err := loadTriageAssessments(triageAssessmentsPath); err == nil {
			persistedAssessments = loaded
		} else if !errors.Is(err, fs.ErrNotExist) {
			// Keep startup resilient when persisted triage assessments are corrupted or unreadable.
			fmt.Fprintf(os.Stderr, "warning: failed to load triage assessments %q: %v\n", triageAssessmentsPath, err)
		}
	}

	return &WorkflowStore{
		appointments:          map[string]model.Appointment{},
		appointmentSearchBlob: map[string]string{},
		appointmentTrigram:    map[string]map[string]struct{}{},
		slots:                 map[string]model.Slot{},
		slotSearchBlob:        map[string]string{},
		slotTrigram:           map[string]map[string]struct{}{},
		queueEntries:          map[string]model.QueueEntry{},
		queueSearchBlob:       map[string]string{},
		queueTrigram:          map[string]map[string]struct{}{},
		triageAssessments:     persistedAssessments,
		fhirResources:         map[string]map[string]any{},
		triageScorer:          scorer,
		triageDB:              triageDB,
		triageModelStatus:     status,
		triageModelHistory:    history,
		triageRegistryPath:    registryPath,
		triageAssessmentsPath: triageAssessmentsPath,
	}
}

type triageModelRegistryState struct {
	Status  model.TriageModelStatus   `json:"status"`
	History []model.TriageModelStatus `json:"history"`
}

type triageAssessmentsState struct {
	Items []model.TriageAssessment `json:"items"`
}

func triageModelRegistryPathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("TRIAGE_MODEL_REGISTRY_PATH"))
	if path == "" {
		return filepath.Join("data", "triage-model-registry.json")
	}
	return path
}

func triageAssessmentsPathFromEnv() string {
	path := strings.TrimSpace(os.Getenv("TRIAGE_ASSESSMENTS_PATH"))
	if path == "" {
		return filepath.Join("data", "triage-assessments.json")
	}
	return path
}

func triagePostgresDSNFromEnv() string {
	return strings.TrimSpace(os.Getenv("TRIAGE_POSTGRES_DSN"))
}

func intFromEnv(name string, defaultValue int) int {
	raw := strings.TrimSpace(os.Getenv(name))
	if raw == "" {
		return defaultValue
	}
	v, err := strconv.Atoi(raw)
	if err != nil || v <= 0 {
		return defaultValue
	}
	return v
}

func loadTriageModelRegistry(path string) (model.TriageModelStatus, []model.TriageModelStatus, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return model.TriageModelStatus{}, nil, err
	}

	var state triageModelRegistryState
	if err := json.Unmarshal(raw, &state); err != nil {
		return model.TriageModelStatus{}, nil, err
	}

	if state.Status.Enabled && state.Status.TimeoutMS <= 0 {
		state.Status.TimeoutMS = 1500
	}
	if state.History == nil {
		state.History = []model.TriageModelStatus{}
	}

	return state.Status, state.History, nil
}

func loadTriageAssessments(path string) (map[string]model.TriageAssessment, error) {
	raw, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var state triageAssessmentsState
	if err := json.Unmarshal(raw, &state); err != nil {
		return nil, err
	}

	out := map[string]model.TriageAssessment{}
	for _, item := range state.Items {
		id := strings.TrimSpace(item.ID)
		if id == "" {
			continue
		}
		out[id] = item
	}

	return out, nil
}

func initTriagePostgresStore(dsn string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return nil, err
	}

	db.SetMaxOpenConns(intFromEnv("TRIAGE_POSTGRES_MAX_OPEN_CONNS", 25))
	db.SetMaxIdleConns(intFromEnv("TRIAGE_POSTGRES_MAX_IDLE_CONNS", 25))
	db.SetConnMaxLifetime(time.Duration(intFromEnv("TRIAGE_POSTGRES_CONN_MAX_LIFETIME_MIN", 30)) * time.Minute)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		_ = db.Close()
		return nil, err
	}

	if _, err := db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS triage_assessments (
			id TEXT PRIMARY KEY,
			created_at TIMESTAMPTZ NOT NULL,
			patient_logical_id TEXT NOT NULL,
			severity TEXT NOT NULL,
			score INTEGER NOT NULL,
			data JSONB NOT NULL
		);
		CREATE INDEX IF NOT EXISTS idx_triage_assessments_created_at ON triage_assessments (created_at DESC);
		CREATE INDEX IF NOT EXISTS idx_triage_assessments_patient ON triage_assessments (patient_logical_id);
		CREATE INDEX IF NOT EXISTS idx_triage_assessments_severity ON triage_assessments (severity);
	`); err != nil {
		_ = db.Close()
		return nil, err
	}

	return db, nil
}

func triageAssessmentCreatedAt(value string) time.Time {
	parsed, err := time.Parse(time.RFC3339, strings.TrimSpace(value))
	if err != nil {
		return time.Now().UTC()
	}
	return parsed
}

func (s *WorkflowStore) persistTriageAssessmentPostgres(assessment model.TriageAssessment) error {
	if s.triageDB == nil {
		return errors.New("triage postgres store is not configured")
	}

	raw, err := json.Marshal(assessment)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	_, err = s.triageDB.ExecContext(ctx, `
		INSERT INTO triage_assessments (id, created_at, patient_logical_id, severity, score, data)
		VALUES ($1, $2, $3, $4, $5, $6)
		ON CONFLICT (id) DO UPDATE SET
			created_at = EXCLUDED.created_at,
			patient_logical_id = EXCLUDED.patient_logical_id,
			severity = EXCLUDED.severity,
			score = EXCLUDED.score,
			data = EXCLUDED.data
	`,
		assessment.ID,
		triageAssessmentCreatedAt(assessment.CreatedAt),
		assessment.PatientLogicalID,
		assessment.Severity,
		assessment.Score,
		raw,
	)
	return err
}

func (s *WorkflowStore) listTriageAssessmentsPostgres(filter model.ListQuery) ([]model.TriageAssessment, error) {
	if s.triageDB == nil {
		return nil, errors.New("triage postgres store is not configured")
	}

	orderBy := "created_at DESC"
	switch strings.ToLower(strings.TrimSpace(filter.Sort)) {
	case "createdat_asc", "created_at_asc":
		orderBy = "created_at ASC"
	case "score_asc":
		orderBy = "score ASC"
	case "score_desc":
		orderBy = "score DESC"
	}

	query := fmt.Sprintf(`
		SELECT data
		FROM triage_assessments
		WHERE ($1 = '' OR patient_logical_id ILIKE $1 OR severity ILIKE $1 OR CAST(data AS TEXT) ILIKE $1)
		ORDER BY %s
		LIMIT $2 OFFSET $3
	`, orderBy)

	needle := strings.TrimSpace(filter.Query)
	if needle != "" {
		needle = "%" + needle + "%"
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	rows, err := s.triageDB.QueryContext(ctx, query, needle, filter.Limit, filter.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.TriageAssessment, 0)
	for rows.Next() {
		var raw []byte
		if err := rows.Scan(&raw); err != nil {
			return nil, err
		}
		var item model.TriageAssessment
		if err := json.Unmarshal(raw, &item); err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return items, nil
}

func (s *WorkflowStore) getTriageAssessmentPostgres(id string) (model.TriageAssessment, bool, error) {
	if s.triageDB == nil {
		return model.TriageAssessment{}, false, errors.New("triage postgres store is not configured")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	var raw []byte
	err := s.triageDB.QueryRowContext(ctx, `SELECT data FROM triage_assessments WHERE id = $1`, id).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		return model.TriageAssessment{}, false, nil
	}
	if err != nil {
		return model.TriageAssessment{}, false, err
	}

	var item model.TriageAssessment
	if err := json.Unmarshal(raw, &item); err != nil {
		return model.TriageAssessment{}, false, err
	}

	return item, true, nil
}

func (s *WorkflowStore) persistTriageModelRegistryLocked() error {
	state := triageModelRegistryState{
		Status:  s.triageModelStatus,
		History: s.triageModelHistory,
	}

	raw, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}

	dir := filepath.Dir(s.triageRegistryPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	tmpPath := s.triageRegistryPath + ".tmp"
	if err := os.WriteFile(tmpPath, raw, 0o644); err != nil {
		return err
	}

	return os.Rename(tmpPath, s.triageRegistryPath)
}

func (s *WorkflowStore) persistTriageAssessmentsLocked() error {
	items := make([]model.TriageAssessment, 0, len(s.triageAssessments))
	for _, assessment := range s.triageAssessments {
		items = append(items, assessment)
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].CreatedAt > items[j].CreatedAt
	})

	state := triageAssessmentsState{Items: items}
	raw, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return err
	}

	dir := filepath.Dir(s.triageAssessmentsPath)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return err
	}

	tmpPath := s.triageAssessmentsPath + ".tmp"
	if err := os.WriteFile(tmpPath, raw, 0o644); err != nil {
		return err
	}

	return os.Rename(tmpPath, s.triageAssessmentsPath)
}

func readTimeoutMSFromEnv(defaultValue int) int {
	raw := strings.TrimSpace(os.Getenv("TRIAGE_AI_TIMEOUT_MS"))
	if raw == "" {
		return defaultValue
	}
	ms, err := strconv.Atoi(raw)
	if err != nil || ms <= 0 {
		return defaultValue
	}
	return ms
}

func (s *WorkflowStore) CreateAppointment(in model.CreateAppointmentRequest) (model.Appointment, error) {
	if in.PatientLogicalID == "" || in.ScheduledAt == "" {
		return model.Appointment{}, errors.New("patientLogicalId and scheduledAt are required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if in.SlotID != "" {
		slot, ok := s.slots[in.SlotID]
		if !ok {
			return model.Appointment{}, errors.New("slot not found")
		}
		if slot.Status != "available" {
			return model.Appointment{}, errors.New("slot is not available")
		}
		slot.Status = "busy"
		s.slots[in.SlotID] = slot
		s.indexSlotLocked(slot)
		s.fhirResources[fhirKey("Slot", in.SlotID)] = slotFHIRPayload(slot)
	}

	appointment := model.Appointment{
		ID:                    newID(),
		PatientLogicalID:      in.PatientLogicalID,
		PractitionerLogicalID: in.PractitionerLogicalID,
		OrganizationLogicalID: in.OrganizationLogicalID,
		SlotID:                in.SlotID,
		ScheduledAt:           in.ScheduledAt,
		Status:                "booked",
	}
	s.appointments[appointment.ID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	return appointment, nil
}

func (s *WorkflowStore) ListAppointments(filter model.ListQuery) []model.Appointment {
	s.mu.RLock()
	defer s.mu.RUnlock()

	needle := strings.ToLower(strings.TrimSpace(filter.Query))
	items := make([]model.Appointment, 0)
	if needle == "" {
		items = make([]model.Appointment, 0, len(s.appointments))
		for _, appointment := range s.appointments {
			items = append(items, appointment)
		}
	} else {
		candidateIDs := matchTrigramIDs(s.appointmentTrigram, s.appointmentSearchBlob, needle)
		if len(candidateIDs) == 0 {
			return []model.Appointment{}
		}
		items = make([]model.Appointment, 0, len(candidateIDs))
		for _, id := range candidateIDs {
			appointment, ok := s.appointments[id]
			if !ok {
				continue
			}
			if strings.Contains(appointmentSearchableText(appointment), normalizeSearchText(needle)) {
				items = append(items, appointment)
			}
		}
	}
	applyAppointmentSort(items, filter.Sort)
	return paginate(items, filter.Offset, filter.Limit)
}

func (s *WorkflowStore) CancelAppointment(in model.CancelAppointmentRequest) (model.Appointment, error) {
	if in.AppointmentID == "" {
		return model.Appointment{}, errors.New("appointmentId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	appointment, ok := s.appointments[in.AppointmentID]
	if !ok {
		return model.Appointment{}, errors.New("appointment not found")
	}
	if appointment.Status == "completed" || appointment.Status == "no-show" {
		return model.Appointment{}, errors.New("appointment cannot be cancelled")
	}

	if appointment.SlotID != "" {
		s.releaseSlotLocked(appointment.SlotID)
	}

	appointment.Status = "cancelled"
	s.appointments[in.AppointmentID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	return appointment, nil
}

func (s *WorkflowStore) RescheduleAppointment(in model.RescheduleAppointmentRequest) (model.Appointment, error) {
	if in.AppointmentID == "" || in.ScheduledAt == "" {
		return model.Appointment{}, errors.New("appointmentId and scheduledAt are required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	appointment, ok := s.appointments[in.AppointmentID]
	if !ok {
		return model.Appointment{}, errors.New("appointment not found")
	}
	if appointment.Status == "cancelled" {
		return model.Appointment{}, errors.New("cancelled appointment cannot be rescheduled")
	}

	if in.SlotID != appointment.SlotID {
		if in.SlotID != "" {
			nextSlot, ok := s.slots[in.SlotID]
			if !ok {
				return model.Appointment{}, errors.New("slot not found")
			}
			if nextSlot.Status != "available" {
				return model.Appointment{}, errors.New("slot is not available")
			}
			nextSlot.Status = "busy"
			s.slots[in.SlotID] = nextSlot
			s.indexSlotLocked(nextSlot)
			s.fhirResources[fhirKey("Slot", in.SlotID)] = slotFHIRPayload(nextSlot)
		}

		if appointment.SlotID != "" {
			s.releaseSlotLocked(appointment.SlotID)
		}

		appointment.SlotID = in.SlotID
	}

	appointment.ScheduledAt = in.ScheduledAt
	appointment.Status = "booked"
	s.appointments[in.AppointmentID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	return appointment, nil
}

func (s *WorkflowStore) MarkAppointmentArrived(in model.AppointmentActionRequest) (model.Appointment, error) {
	if in.AppointmentID == "" {
		return model.Appointment{}, errors.New("appointmentId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	appointment, ok := s.appointments[in.AppointmentID]
	if !ok {
		return model.Appointment{}, errors.New("appointment not found")
	}
	if appointment.Status == "cancelled" || appointment.Status == "no-show" || appointment.Status == "completed" {
		return model.Appointment{}, errors.New("appointment cannot be marked arrived")
	}

	appointment.Status = "arrived"
	s.appointments[in.AppointmentID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	return appointment, nil
}

func (s *WorkflowStore) CompleteAppointment(in model.AppointmentActionRequest) (model.Appointment, error) {
	if in.AppointmentID == "" {
		return model.Appointment{}, errors.New("appointmentId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	appointment, ok := s.appointments[in.AppointmentID]
	if !ok {
		return model.Appointment{}, errors.New("appointment not found")
	}
	if appointment.Status == "cancelled" || appointment.Status == "no-show" {
		return model.Appointment{}, errors.New("appointment cannot be completed")
	}

	appointment.Status = "completed"
	s.appointments[in.AppointmentID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	if appointment.SlotID != "" {
		s.releaseSlotLocked(appointment.SlotID)
	}
	return appointment, nil
}

func (s *WorkflowStore) MarkAppointmentNoShow(in model.AppointmentActionRequest) (model.Appointment, error) {
	if in.AppointmentID == "" {
		return model.Appointment{}, errors.New("appointmentId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	appointment, ok := s.appointments[in.AppointmentID]
	if !ok {
		return model.Appointment{}, errors.New("appointment not found")
	}
	if appointment.Status == "cancelled" || appointment.Status == "completed" {
		return model.Appointment{}, errors.New("appointment cannot be marked no-show")
	}

	appointment.Status = "no-show"
	s.appointments[in.AppointmentID] = appointment
	s.indexAppointmentLocked(appointment)
	s.fhirResources[fhirKey("Appointment", appointment.ID)] = appointmentFHIRPayload(appointment)
	if appointment.SlotID != "" {
		s.releaseSlotLocked(appointment.SlotID)
	}
	return appointment, nil
}

func (s *WorkflowStore) CreateSlot(in model.CreateSlotRequest) (model.Slot, error) {
	if in.StartAt == "" || in.EndAt == "" {
		return model.Slot{}, errors.New("startAt and endAt are required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	slot := model.Slot{
		ID:                    newID(),
		PractitionerLogicalID: in.PractitionerLogicalID,
		OrganizationLogicalID: in.OrganizationLogicalID,
		StartAt:               in.StartAt,
		EndAt:                 in.EndAt,
		Status:                "available",
	}
	s.slots[slot.ID] = slot
	s.indexSlotLocked(slot)
	s.fhirResources[fhirKey("Slot", slot.ID)] = slotFHIRPayload(slot)
	return slot, nil
}

func (s *WorkflowStore) ListSlots(filter model.ListQuery) []model.Slot {
	s.mu.RLock()
	defer s.mu.RUnlock()

	needle := strings.ToLower(strings.TrimSpace(filter.Query))
	items := make([]model.Slot, 0)
	if needle == "" {
		items = make([]model.Slot, 0, len(s.slots))
		for _, slot := range s.slots {
			items = append(items, slot)
		}
	} else {
		candidateIDs := matchTrigramIDs(s.slotTrigram, s.slotSearchBlob, needle)
		if len(candidateIDs) == 0 {
			return []model.Slot{}
		}
		items = make([]model.Slot, 0, len(candidateIDs))
		for _, id := range candidateIDs {
			slot, ok := s.slots[id]
			if !ok {
				continue
			}
			if strings.Contains(slotSearchableText(slot), normalizeSearchText(needle)) {
				items = append(items, slot)
			}
		}
	}
	applySlotSort(items, filter.Sort)
	return paginate(items, filter.Offset, filter.Limit)
}

func (s *WorkflowStore) Enqueue(in model.EnqueueRequest) (model.QueueEntry, error) {
	if in.PatientLogicalID == "" {
		return model.QueueEntry{}, errors.New("patientLogicalId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	position := 1
	for _, item := range s.queueEntries {
		if item.LocationLogicalID == in.LocationLogicalID && item.Status == "waiting" {
			position++
		}
	}

	entry := model.QueueEntry{
		ID:                newID(),
		AppointmentID:     in.AppointmentID,
		PatientLogicalID:  in.PatientLogicalID,
		LocationLogicalID: in.LocationLogicalID,
		Status:            "waiting",
		Position:          position,
		CreatedAt:         time.Now().UTC().Format(time.RFC3339),
	}
	s.queueEntries[entry.ID] = entry
	s.indexQueueEntryLocked(entry)
	s.fhirResources[fhirKey("Task", entry.ID)] = queueTaskFHIRPayload(entry)
	return entry, nil
}

func (s *WorkflowStore) ListQueue(filter model.ListQuery) []model.QueueEntry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	needle := strings.ToLower(strings.TrimSpace(filter.Query))
	items := make([]model.QueueEntry, 0)
	if needle == "" {
		items = make([]model.QueueEntry, 0, len(s.queueEntries))
		for _, entry := range s.queueEntries {
			items = append(items, entry)
		}
	} else {
		candidateIDs := matchTrigramIDs(s.queueTrigram, s.queueSearchBlob, needle)
		if len(candidateIDs) == 0 {
			return []model.QueueEntry{}
		}
		items = make([]model.QueueEntry, 0, len(candidateIDs))
		for _, id := range candidateIDs {
			entry, ok := s.queueEntries[id]
			if !ok {
				continue
			}
			if strings.Contains(queueSearchableText(entry), normalizeSearchText(needle)) {
				items = append(items, entry)
			}
		}
	}
	applyQueueSort(items, filter.Sort)
	return paginate(items, filter.Offset, filter.Limit)
}

func applyAppointmentSort(items []model.Appointment, sortKey string) {
	key := strings.ToLower(strings.TrimSpace(sortKey))
	sort.Slice(items, func(i, j int) bool {
		switch key {
		case "scheduledat_desc", "scheduled_at_desc":
			if items[i].ScheduledAt == items[j].ScheduledAt {
				return items[i].ID > items[j].ID
			}
			return items[i].ScheduledAt > items[j].ScheduledAt
		case "scheduledat_asc", "scheduled_at_asc":
			if items[i].ScheduledAt == items[j].ScheduledAt {
				return items[i].ID < items[j].ID
			}
			return items[i].ScheduledAt < items[j].ScheduledAt
		case "status_desc":
			if items[i].Status == items[j].Status {
				return items[i].ID > items[j].ID
			}
			return items[i].Status > items[j].Status
		case "status_asc":
			if items[i].Status == items[j].Status {
				return items[i].ID < items[j].ID
			}
			return items[i].Status < items[j].Status
		case "id_desc":
			return items[i].ID > items[j].ID
		default:
			if items[i].ScheduledAt == items[j].ScheduledAt {
				return items[i].ID < items[j].ID
			}
			return items[i].ScheduledAt < items[j].ScheduledAt
		}
	})
}

func applySlotSort(items []model.Slot, sortKey string) {
	key := strings.ToLower(strings.TrimSpace(sortKey))
	sort.Slice(items, func(i, j int) bool {
		switch key {
		case "startat_desc", "start_at_desc":
			if items[i].StartAt == items[j].StartAt {
				return items[i].ID > items[j].ID
			}
			return items[i].StartAt > items[j].StartAt
		case "startat_asc", "start_at_asc":
			if items[i].StartAt == items[j].StartAt {
				return items[i].ID < items[j].ID
			}
			return items[i].StartAt < items[j].StartAt
		case "status_desc":
			if items[i].Status == items[j].Status {
				return items[i].ID > items[j].ID
			}
			return items[i].Status > items[j].Status
		case "status_asc":
			if items[i].Status == items[j].Status {
				return items[i].ID < items[j].ID
			}
			return items[i].Status < items[j].Status
		case "id_desc":
			return items[i].ID > items[j].ID
		default:
			if items[i].StartAt == items[j].StartAt {
				return items[i].ID < items[j].ID
			}
			return items[i].StartAt < items[j].StartAt
		}
	})
}

func applyQueueSort(items []model.QueueEntry, sortKey string) {
	key := strings.ToLower(strings.TrimSpace(sortKey))
	sort.Slice(items, func(i, j int) bool {
		switch key {
		case "position_desc":
			if items[i].Position == items[j].Position {
				return items[i].CreatedAt > items[j].CreatedAt
			}
			return items[i].Position > items[j].Position
		case "position_asc":
			if items[i].Position == items[j].Position {
				return items[i].CreatedAt < items[j].CreatedAt
			}
			return items[i].Position < items[j].Position
		case "createdat_desc", "created_at_desc":
			if items[i].CreatedAt == items[j].CreatedAt {
				return items[i].ID > items[j].ID
			}
			return items[i].CreatedAt > items[j].CreatedAt
		case "createdat_asc", "created_at_asc":
			if items[i].CreatedAt == items[j].CreatedAt {
				return items[i].ID < items[j].ID
			}
			return items[i].CreatedAt < items[j].CreatedAt
		case "id_desc":
			return items[i].ID > items[j].ID
		default:
			if items[i].Position == items[j].Position {
				return items[i].CreatedAt < items[j].CreatedAt
			}
			return items[i].Position < items[j].Position
		}
	})
}

func (s *WorkflowStore) CheckIn(in model.CheckInRequest) (model.QueueEntry, error) {
	if in.QueueEntryID == "" {
		return model.QueueEntry{}, errors.New("queueEntryId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.queueEntries[in.QueueEntryID]
	if !ok {
		return model.QueueEntry{}, errors.New("queue entry not found")
	}
	entry.Status = "checked-in"
	s.queueEntries[in.QueueEntryID] = entry
	s.indexQueueEntryLocked(entry)
	s.fhirResources[fhirKey("Task", entry.ID)] = queueTaskFHIRPayload(entry)
	return entry, nil
}

func (s *WorkflowStore) AdvanceQueue(in model.QueueActionRequest) (model.QueueEntry, error) {
	if in.QueueEntryID == "" {
		return model.QueueEntry{}, errors.New("queueEntryId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.queueEntries[in.QueueEntryID]
	if !ok {
		return model.QueueEntry{}, errors.New("queue entry not found")
	}
	if entry.Status == "completed" {
		return model.QueueEntry{}, errors.New("queue entry already completed")
	}
	entry.Status = "in-progress"
	s.queueEntries[in.QueueEntryID] = entry
	s.indexQueueEntryLocked(entry)
	s.fhirResources[fhirKey("Task", entry.ID)] = queueTaskFHIRPayload(entry)
	return entry, nil
}

func (s *WorkflowStore) CompleteQueue(in model.QueueActionRequest) (model.QueueEntry, error) {
	if in.QueueEntryID == "" {
		return model.QueueEntry{}, errors.New("queueEntryId is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	entry, ok := s.queueEntries[in.QueueEntryID]
	if !ok {
		return model.QueueEntry{}, errors.New("queue entry not found")
	}
	entry.Status = "completed"
	s.queueEntries[in.QueueEntryID] = entry
	s.indexQueueEntryLocked(entry)
	s.fhirResources[fhirKey("Task", entry.ID)] = queueTaskFHIRPayload(entry)
	return entry, nil
}

func (s *WorkflowStore) AssessTriage(in model.TriageRequest) (model.TriageAssessment, error) {
	if in.PatientLogicalID == "" {
		return model.TriageAssessment{}, errors.New("patientLogicalId is required")
	}

	ruleSeverity := triageSeverityFromRules(in)
	finalSeverity := ruleSeverity
	aiSeverity := ""
	aiScore := 0
	aiConfidence := 0.0
	aiFallbackUsed := false
	aiModelVersion := ""
	aiReasons := []string{}
	suggestions := []string{}

	if s.triageScorer != nil {
		result, err := s.triageScorer.Score(context.Background(), TriageScoreInput{
			Symptoms: in.Symptoms,
			RedFlags: in.RedFlags,
			AgeYears: in.AgeYears,
			Channel:  in.Channel,
			Vitals: map[string]any{
				"systolicBp":       in.Vitals.SystolicBP,
				"diastolicBp":      in.Vitals.DiastolicBP,
				"heartRate":        in.Vitals.HeartRate,
				"respiratoryRate":  in.Vitals.RespiratoryRate,
				"temperatureC":     in.Vitals.TemperatureC,
				"oxygenSaturation": in.Vitals.OxygenSaturation,
				"bloodGlucoseMgDl": in.Vitals.BloodGlucoseMgDl,
				"painScore":        in.Vitals.PainScore,
				"consciousness":    in.Vitals.Consciousness,
				"weightKg":         in.Vitals.WeightKg,
				"heightCm":         in.Vitals.HeightCm,
			},
			Context: map[string]any{
				"pregnant":           in.Context.Pregnant,
				"trimester":          in.Context.Trimester,
				"chiefComplaint":     in.Context.ChiefComplaint,
				"onsetHours":         in.Context.OnsetHours,
				"chronicConditions":  in.Context.ChronicConditions,
				"currentMedications": in.Context.CurrentMedications,
				"knownAllergies":     in.Context.KnownAllergies,
			},
		})
		if err == nil {
			aiSeverity = strings.ToLower(strings.TrimSpace(result.AISeverity))
			aiScore = result.AIScore
			aiConfidence = result.Confidence
			aiFallbackUsed = result.FallbackUsed
			aiModelVersion = result.ModelVersion
			aiReasons = result.Reasons
			suggestions = append(suggestions, result.Suggestions...)

			normalizedFinal := strings.ToLower(strings.TrimSpace(result.FinalSeverity))
			if normalizedFinal != "" {
				finalSeverity = normalizedFinal
			}
		} else {
			aiFallbackUsed = true
			aiReasons = []string{"AI scorer unavailable; rules fallback used."}
		}
	}

	if len(in.RedFlags) > 0 {
		finalSeverity = "emergent"
		aiFallbackUsed = true
	}

	suggestions = append(suggestions, ruleBasedSuggestions(in, finalSeverity)...)
	suggestions = uniqueLowerPreserveOrder(suggestions)

	score := triageScoreFromSeverity(finalSeverity)
	action := triageActionFromSeverity(finalSeverity)

	assessment := model.TriageAssessment{
		ID:                newID(),
		PatientLogicalID:  in.PatientLogicalID,
		Symptoms:          in.Symptoms,
		RedFlags:          in.RedFlags,
		Vitals:            in.Vitals,
		Context:           in.Context,
		Severity:          finalSeverity,
		Score:             score,
		RecommendedAction: action,
		Suggestions:       suggestions,
		AISeverity:        aiSeverity,
		AIScore:           aiScore,
		AIConfidence:      aiConfidence,
		AIFallbackUsed:    aiFallbackUsed,
		AIModelVersion:    aiModelVersion,
		AIReasons:         aiReasons,
		CreatedAt:         time.Now().UTC().Format(time.RFC3339),
	}

	if s.triageDB != nil {
		if err := s.persistTriageAssessmentPostgres(assessment); err != nil {
			return model.TriageAssessment{}, err
		}
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	s.triageAssessments[assessment.ID] = assessment
	s.fhirResources[fhirKey("Observation", assessment.ID)] = triageObservationFHIRPayload(assessment)
	if s.triageDB == nil {
		if err := s.persistTriageAssessmentsLocked(); err != nil {
			delete(s.triageAssessments, assessment.ID)
			delete(s.fhirResources, fhirKey("Observation", assessment.ID))
			return model.TriageAssessment{}, err
		}
	}
	return assessment, nil
}

func (s *WorkflowStore) ListTriageAssessments(filter model.ListQuery) []model.TriageAssessment {
	if s.triageDB != nil {
		items, err := s.listTriageAssessmentsPostgres(filter)
		if err == nil {
			return items
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	needle := strings.ToLower(strings.TrimSpace(filter.Query))
	items := make([]model.TriageAssessment, 0, len(s.triageAssessments))
	for _, assessment := range s.triageAssessments {
		if needle != "" {
			blob := strings.ToLower(strings.Join([]string{
				assessment.ID,
				assessment.PatientLogicalID,
				assessment.Severity,
				assessment.RecommendedAction,
				assessment.AISeverity,
				strings.Join(assessment.Symptoms, " "),
				strings.Join(assessment.RedFlags, " "),
				strings.Join(assessment.Suggestions, " "),
			}, " "))
			if !strings.Contains(blob, needle) {
				continue
			}
		}
		items = append(items, assessment)
	}

	sort.Slice(items, func(i, j int) bool {
		sortKey := strings.ToLower(strings.TrimSpace(filter.Sort))
		switch sortKey {
		case "createdat_asc", "created_at_asc":
			return items[i].CreatedAt < items[j].CreatedAt
		case "score_asc":
			return items[i].Score < items[j].Score
		case "score_desc":
			return items[i].Score > items[j].Score
		default:
			return items[i].CreatedAt > items[j].CreatedAt
		}
	})

	if filter.Offset >= len(items) {
		return []model.TriageAssessment{}
	}

	start := filter.Offset
	end := len(items)
	if filter.Limit > 0 && start+filter.Limit < end {
		end = start + filter.Limit
	}

	return append([]model.TriageAssessment{}, items[start:end]...)
}

func (s *WorkflowStore) GetTriageAssessment(id string) (model.TriageAssessment, bool) {
	if s.triageDB != nil {
		assessment, ok, err := s.getTriageAssessmentPostgres(id)
		if err == nil {
			return assessment, ok
		}
	}

	s.mu.RLock()
	defer s.mu.RUnlock()

	assessment, ok := s.triageAssessments[id]
	if !ok {
		return model.TriageAssessment{}, false
	}
	return assessment, true
}

func (s *WorkflowStore) ActivateTriageModel(in model.ActivateTriageModelRequest, meta model.TriageModelActionMetadata) (model.TriageModelStatus, error) {
	if strings.TrimSpace(in.ModelVersion) == "" || strings.TrimSpace(in.ScorerBaseURL) == "" {
		return model.TriageModelStatus{}, errors.New("modelVersion and scorerBaseUrl are required")
	}

	timeoutMS := in.TimeoutMS
	if timeoutMS <= 0 {
		timeoutMS = 1500
	}
	timeout := time.Duration(timeoutMS) * time.Millisecond

	if err := probeTriageScorer(context.Background(), in.ScorerBaseURL, timeout); err != nil {
		return model.TriageModelStatus{}, err
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	oldStatus := s.triageModelStatus
	oldHistory := append([]model.TriageModelStatus{}, s.triageModelHistory...)
	oldScorer := s.triageScorer

	if s.triageModelStatus.Enabled {
		previous := s.triageModelStatus
		previous.AuditEvents = nil
		s.triageModelHistory = append(s.triageModelHistory, previous)
	}

	reason := strings.TrimSpace(meta.Reason)
	if reason == "" {
		reason = strings.TrimSpace(in.Reason)
	}
	actor := strings.TrimSpace(meta.Actor)
	if actor == "" {
		actor = "unknown"
	}

	s.triageScorer = newTriageScorerWithConfig(in.ScorerBaseURL, timeout)
	s.triageModelStatus.Enabled = true
	s.triageModelStatus.ModelVersion = strings.TrimSpace(in.ModelVersion)
	s.triageModelStatus.ScorerBaseURL = strings.TrimSpace(in.ScorerBaseURL)
	s.triageModelStatus.TimeoutMS = timeoutMS
	s.triageModelStatus.LastActivatedAt = time.Now().UTC().Format(time.RFC3339)
	s.triageModelStatus.AuditEvents = append(s.triageModelStatus.AuditEvents, model.TriageModelAuditEvent{
		Action:        "activate",
		ModelVersion:  s.triageModelStatus.ModelVersion,
		ScorerBaseURL: s.triageModelStatus.ScorerBaseURL,
		Actor:         actor,
		Reason:        reason,
		At:            time.Now().UTC().Format(time.RFC3339),
		Result:        "ok",
	})

	if err := s.persistTriageModelRegistryLocked(); err != nil {
		s.triageModelStatus = oldStatus
		s.triageModelHistory = oldHistory
		s.triageScorer = oldScorer
		return model.TriageModelStatus{}, err
	}

	return s.triageModelStatus, nil
}

func (s *WorkflowStore) RollbackTriageModel(meta model.TriageModelActionMetadata) (model.TriageModelStatus, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	oldStatus := s.triageModelStatus
	oldHistory := append([]model.TriageModelStatus{}, s.triageModelHistory...)
	oldScorer := s.triageScorer

	if len(s.triageModelHistory) == 0 {
		return model.TriageModelStatus{}, errors.New("no previous model version to rollback")
	}

	previous := s.triageModelHistory[len(s.triageModelHistory)-1]
	s.triageModelHistory = s.triageModelHistory[:len(s.triageModelHistory)-1]
	actor := strings.TrimSpace(meta.Actor)
	if actor == "" {
		actor = "unknown"
	}

	if previous.Enabled {
		timeout := time.Duration(previous.TimeoutMS) * time.Millisecond
		if timeout <= 0 {
			timeout = 1500 * time.Millisecond
		}
		s.triageScorer = newTriageScorerWithConfig(previous.ScorerBaseURL, timeout)
	} else {
		s.triageScorer = nil
	}

	previous.AuditEvents = append(previous.AuditEvents, model.TriageModelAuditEvent{
		Action:        "rollback",
		ModelVersion:  previous.ModelVersion,
		ScorerBaseURL: previous.ScorerBaseURL,
		Actor:         actor,
		Reason:        strings.TrimSpace(meta.Reason),
		At:            time.Now().UTC().Format(time.RFC3339),
		Result:        "ok",
	})

	s.triageModelStatus = previous
	if err := s.persistTriageModelRegistryLocked(); err != nil {
		s.triageModelStatus = oldStatus
		s.triageModelHistory = oldHistory
		s.triageScorer = oldScorer
		return model.TriageModelStatus{}, err
	}
	return s.triageModelStatus, nil
}

func (s *WorkflowStore) TriageModelStatus() model.TriageModelStatus {
	s.mu.RLock()
	defer s.mu.RUnlock()
	status := s.triageModelStatus
	status.AuditEvents = append([]model.TriageModelAuditEvent{}, s.triageModelStatus.AuditEvents...)
	return status
}

func triageSeverityFromRules(in model.TriageRequest) string {
	if len(in.RedFlags) > 0 {
		return "emergent"
	}

	severity := "low"
	if len(in.Symptoms) >= 4 {
		severity = maxSeverity(severity, "high")
	} else if len(in.Symptoms) >= 2 {
		severity = maxSeverity(severity, "moderate")
	}

	v := in.Vitals
	if isAlteredConsciousness(v.Consciousness) {
		severity = maxSeverity(severity, "emergent")
	}
	if v.OxygenSaturation > 0 {
		if v.OxygenSaturation < 90 {
			severity = maxSeverity(severity, "emergent")
		} else if v.OxygenSaturation < 94 {
			severity = maxSeverity(severity, "high")
		}
	}
	if v.SystolicBP > 0 {
		if v.SystolicBP < 90 || v.SystolicBP > 180 {
			severity = maxSeverity(severity, "emergent")
		} else if v.SystolicBP < 100 {
			severity = maxSeverity(severity, "high")
		}
	}
	if v.DiastolicBP > 0 && v.DiastolicBP > 120 {
		severity = maxSeverity(severity, "emergent")
	}
	if v.HeartRate > 130 || (v.HeartRate > 0 && v.HeartRate < 45) {
		severity = maxSeverity(severity, "emergent")
	} else if v.HeartRate > 110 {
		severity = maxSeverity(severity, "high")
	}
	if v.RespiratoryRate > 30 || (v.RespiratoryRate > 0 && v.RespiratoryRate < 8) {
		severity = maxSeverity(severity, "emergent")
	} else if v.RespiratoryRate > 24 {
		severity = maxSeverity(severity, "high")
	}
	if v.TemperatureC >= 40.0 {
		severity = maxSeverity(severity, "emergent")
	} else if v.TemperatureC >= 38.5 {
		severity = maxSeverity(severity, "high")
	}
	if v.BloodGlucoseMgDl > 0 {
		if v.BloodGlucoseMgDl < 54 || v.BloodGlucoseMgDl > 400 {
			severity = maxSeverity(severity, "emergent")
		} else if v.BloodGlucoseMgDl < 70 || v.BloodGlucoseMgDl > 300 {
			severity = maxSeverity(severity, "high")
		}
	}
	if v.PainScore >= 8 {
		severity = maxSeverity(severity, "high")
	} else if v.PainScore >= 5 {
		severity = maxSeverity(severity, "moderate")
	}

	if in.AgeYears > 0 && (in.AgeYears < 5 || in.AgeYears >= 65) {
		severity = escalateSeverity(severity)
	}
	if len(in.Context.ChronicConditions) >= 3 || (in.Context.Pregnant && in.Context.Trimester == 3) {
		severity = maxSeverity(severity, "high")
	}

	return severity
}

func severityRank(severity string) int {
	switch severity {
	case "emergent":
		return 4
	case "high":
		return 3
	case "moderate":
		return 2
	default:
		return 1
	}
}

func maxSeverity(current, next string) string {
	if severityRank(next) > severityRank(current) {
		return next
	}
	return current
}

func escalateSeverity(current string) string {
	switch current {
	case "low":
		return "moderate"
	case "moderate":
		return "high"
	case "high":
		return "emergent"
	default:
		return current
	}
}

func isAlteredConsciousness(consciousness string) bool {
	v := strings.ToLower(strings.TrimSpace(consciousness))
	if v == "" || v == "alert" || v == "a" {
		return false
	}
	return true
}

func ruleBasedSuggestions(in model.TriageRequest, severity string) []string {
	out := make([]string, 0, 8)
	v := in.Vitals

	if v.SystolicBP > 0 || v.DiastolicBP > 0 {
		out = append(out, "Repeat blood pressure in 5-10 minutes using proper cuff size and posture.")
	}
	if v.OxygenSaturation > 0 && v.OxygenSaturation < 94 {
		out = append(out, "Low oxygen saturation detected. Start oxygen protocol and prioritize clinician review.")
	}
	if v.PainScore >= 7 {
		out = append(out, "Severe pain reported. Perform focused pain assessment and analgesia protocol.")
	}
	if len(in.Context.KnownAllergies) > 0 {
		out = append(out, "Allergy history present. Verify medication safety before treatment.")
	}
	if in.Context.Pregnant {
		out = append(out, "Pregnancy context present. Use obstetric-safe triage pathway.")
	}
	if in.AgeYears > 0 && (in.AgeYears < 5 || in.AgeYears >= 65) {
		out = append(out, "Age-risk category detected. Increase observation frequency.")
	}

	switch severity {
	case "emergent":
		out = append(out, "Immediate emergency review recommended.")
	case "high":
		out = append(out, "Urgent clinician review recommended.")
	case "moderate":
		out = append(out, "Nurse triage with short-interval reassessment recommended.")
	default:
		out = append(out, "Routine queue with safety-net instructions.")
	}

	return out
}

func uniqueLowerPreserveOrder(items []string) []string {
	seen := map[string]struct{}{}
	out := make([]string, 0, len(items))
	for _, item := range items {
		trimmed := strings.TrimSpace(item)
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

func triageScoreFromSeverity(severity string) int {
	switch severity {
	case "emergent":
		return 90
	case "high":
		return 70
	case "moderate":
		return 45
	default:
		return 20
	}
}

func triageActionFromSeverity(severity string) string {
	switch severity {
	case "emergent":
		return "immediate_emergency_review"
	case "high":
		return "urgent_clinician_review"
	case "moderate":
		return "nurse_triage_within_30_min"
	default:
		return "routine_queue"
	}
}

func (s *WorkflowStore) FindFHIRResource(resourceType, logicalID string) (map[string]any, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	resource, ok := s.fhirResources[fhirKey(resourceType, logicalID)]
	if !ok {
		return nil, false
	}
	return resource, true
}

func (s *WorkflowStore) releaseSlotLocked(slotID string) {
	slot, ok := s.slots[slotID]
	if !ok {
		return
	}
	slot.Status = "available"
	s.slots[slotID] = slot
	s.indexSlotLocked(slot)
	s.fhirResources[fhirKey("Slot", slotID)] = slotFHIRPayload(slot)
}

func paginate[T any](items []T, offset, limit int) []T {
	if offset < 0 {
		offset = 0
	}
	if offset > len(items) {
		offset = len(items)
	}
	end := len(items)
	if limit > 0 && offset+limit < end {
		end = offset + limit
	}
	out := make([]T, 0, end-offset)
	out = append(out, items[offset:end]...)
	return out
}

func newID() string {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "id-fallback"
	}
	return hex.EncodeToString(b)
}

func (s *WorkflowStore) indexAppointmentLocked(appointment model.Appointment) {
	if oldBlob, ok := s.appointmentSearchBlob[appointment.ID]; ok {
		removeTrigramIndex(s.appointmentTrigram, s.appointmentSearchBlob, appointment.ID, oldBlob)
	}
	addTrigramIndex(s.appointmentTrigram, s.appointmentSearchBlob, appointment.ID, appointmentSearchableText(appointment))
}

func (s *WorkflowStore) indexSlotLocked(slot model.Slot) {
	if oldBlob, ok := s.slotSearchBlob[slot.ID]; ok {
		removeTrigramIndex(s.slotTrigram, s.slotSearchBlob, slot.ID, oldBlob)
	}
	addTrigramIndex(s.slotTrigram, s.slotSearchBlob, slot.ID, slotSearchableText(slot))
}

func (s *WorkflowStore) indexQueueEntryLocked(entry model.QueueEntry) {
	if oldBlob, ok := s.queueSearchBlob[entry.ID]; ok {
		removeTrigramIndex(s.queueTrigram, s.queueSearchBlob, entry.ID, oldBlob)
	}
	addTrigramIndex(s.queueTrigram, s.queueSearchBlob, entry.ID, queueSearchableText(entry))
}

func appointmentSearchableText(appointment model.Appointment) string {
	return normalizeSearchText(appointment.PatientLogicalID + " " + appointment.PractitionerLogicalID + " " + appointment.OrganizationLogicalID + " " + appointment.Status + " " + appointment.ScheduledAt)
}

func slotSearchableText(slot model.Slot) string {
	return normalizeSearchText(slot.PractitionerLogicalID + " " + slot.OrganizationLogicalID + " " + slot.Status + " " + slot.StartAt + " " + slot.EndAt)
}

func queueSearchableText(entry model.QueueEntry) string {
	return normalizeSearchText(entry.PatientLogicalID + " " + entry.LocationLogicalID + " " + entry.Status + " " + strconv.Itoa(entry.Position))
}

func normalizeSearchText(raw string) string {
	parts := strings.Fields(strings.ToLower(strings.TrimSpace(raw)))
	return strings.Join(parts, " ")
}

func addTrigramIndex(index map[string]map[string]struct{}, blobs map[string]string, id, text string) {
	blobs[id] = text
	for _, gram := range trigrams(text) {
		bucket, ok := index[gram]
		if !ok {
			bucket = map[string]struct{}{}
			index[gram] = bucket
		}
		bucket[id] = struct{}{}
	}
}

func removeTrigramIndex(index map[string]map[string]struct{}, blobs map[string]string, id, text string) {
	for _, gram := range trigrams(text) {
		bucket, ok := index[gram]
		if !ok {
			continue
		}
		delete(bucket, id)
		if len(bucket) == 0 {
			delete(index, gram)
		}
	}
	delete(blobs, id)
}

func matchTrigramIDs(index map[string]map[string]struct{}, blobs map[string]string, query string) []string {
	needle := normalizeSearchText(query)
	if needle == "" {
		return []string{}
	}
	if len(needle) < 3 {
		out := make([]string, 0, len(blobs))
		for id := range blobs {
			out = append(out, id)
		}
		return out
	}

	grams := trigrams(needle)
	if len(grams) == 0 {
		out := make([]string, 0, len(blobs))
		for id := range blobs {
			out = append(out, id)
		}
		return out
	}

	var ids map[string]struct{}
	for i, gram := range grams {
		bucket, ok := index[gram]
		if !ok {
			return []string{}
		}
		if i == 0 {
			ids = make(map[string]struct{}, len(bucket))
			for id := range bucket {
				ids[id] = struct{}{}
			}
			continue
		}
		for id := range ids {
			if _, ok := bucket[id]; !ok {
				delete(ids, id)
			}
		}
		if len(ids) == 0 {
			return []string{}
		}
	}

	out := make([]string, 0, len(ids))
	for id := range ids {
		out = append(out, id)
	}
	return out
}

func trigrams(text string) []string {
	if len(text) < 3 {
		if text == "" {
			return nil
		}
		return []string{text}
	}
	set := make(map[string]struct{})
	for i := 0; i <= len(text)-3; i++ {
		set[text[i:i+3]] = struct{}{}
	}
	out := make([]string, 0, len(set))
	for gram := range set {
		out = append(out, gram)
	}
	return out
}

func fhirKey(resourceType, logicalID string) string {
	return resourceType + "|" + logicalID
}

func appointmentFHIRPayload(a model.Appointment) map[string]any {
	payload := map[string]any{
		"resourceType": "Appointment",
		"id":           a.ID,
		"status":       appointmentStatusToFHIR(a.Status),
		"start":        a.ScheduledAt,
	}

	participants := []map[string]any{{
		"actor":  map[string]any{"reference": "Patient/" + a.PatientLogicalID},
		"status": "accepted",
	}}
	if a.PractitionerLogicalID != "" {
		participants = append(participants, map[string]any{
			"actor":  map[string]any{"reference": "Practitioner/" + a.PractitionerLogicalID},
			"status": "accepted",
		})
	}
	payload["participant"] = participants

	if a.OrganizationLogicalID != "" {
		payload["supportingInformation"] = []map[string]any{{"reference": "Organization/" + a.OrganizationLogicalID}}
	}
	if a.SlotID != "" {
		payload["slot"] = []map[string]any{{"reference": "Slot/" + a.SlotID}}
	}

	return payload
}

func slotFHIRPayload(s model.Slot) map[string]any {
	payload := map[string]any{
		"resourceType": "Slot",
		"id":           s.ID,
		"status":       slotStatusToFHIR(s.Status),
		"start":        s.StartAt,
		"end":          s.EndAt,
	}
	if s.PractitionerLogicalID != "" {
		payload["comment"] = "Practitioner/" + s.PractitionerLogicalID
	}
	if s.OrganizationLogicalID != "" {
		payload["serviceType"] = []map[string]any{{"text": s.OrganizationLogicalID}}
	}
	return payload
}

func queueTaskFHIRPayload(q model.QueueEntry) map[string]any {
	payload := map[string]any{
		"resourceType": "Task",
		"id":           q.ID,
		"status":       queueStatusToTaskStatus(q.Status),
		"intent":       "order",
		"for":          map[string]any{"reference": "Patient/" + q.PatientLogicalID},
		"authoredOn":   q.CreatedAt,
		"priority":     "routine",
	}
	if q.AppointmentID != "" {
		payload["focus"] = map[string]any{"reference": "Appointment/" + q.AppointmentID}
	}
	if q.LocationLogicalID != "" {
		payload["location"] = map[string]any{"reference": "Location/" + q.LocationLogicalID}
	}
	payload["description"] = "Queue position " + strings.TrimSpace(strconv.Itoa(q.Position))
	return payload
}

func triageObservationFHIRPayload(t model.TriageAssessment) map[string]any {
	components := []map[string]any{
		{
			"code": map[string]any{"coding": []map[string]any{{
				"system":  "http://snomed.info/sct",
				"code":    "106228001",
				"display": "Triage category",
			}}, "text": "Triage Severity"},
			"valueString": t.Severity,
		},
		{
			"code":        map[string]any{"text": "Recommended Action"},
			"valueString": t.RecommendedAction,
		},
	}

	if t.Vitals.SystolicBP > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "8480-6", "display": "Systolic blood pressure"}}, "text": "Systolic BP"},
			"valueQuantity": map[string]any{"value": t.Vitals.SystolicBP, "unit": "mm[Hg]", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"},
		})
	}
	if t.Vitals.DiastolicBP > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "8462-4", "display": "Diastolic blood pressure"}}, "text": "Diastolic BP"},
			"valueQuantity": map[string]any{"value": t.Vitals.DiastolicBP, "unit": "mm[Hg]", "system": "http://unitsofmeasure.org", "code": "mm[Hg]"},
		})
	}
	if t.Vitals.HeartRate > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "8867-4", "display": "Heart rate"}}, "text": "Heart Rate"},
			"valueQuantity": map[string]any{"value": t.Vitals.HeartRate, "unit": "/min", "system": "http://unitsofmeasure.org", "code": "/min"},
		})
	}
	if t.Vitals.RespiratoryRate > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "9279-1", "display": "Respiratory rate"}}, "text": "Respiratory Rate"},
			"valueQuantity": map[string]any{"value": t.Vitals.RespiratoryRate, "unit": "/min", "system": "http://unitsofmeasure.org", "code": "/min"},
		})
	}
	if t.Vitals.TemperatureC > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "8310-5", "display": "Body temperature"}}, "text": "Temperature"},
			"valueQuantity": map[string]any{"value": t.Vitals.TemperatureC, "unit": "Cel", "system": "http://unitsofmeasure.org", "code": "Cel"},
		})
	}
	if t.Vitals.OxygenSaturation > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "59408-5", "display": "Oxygen saturation in Arterial blood"}}, "text": "SpO2"},
			"valueQuantity": map[string]any{"value": t.Vitals.OxygenSaturation, "unit": "%", "system": "http://unitsofmeasure.org", "code": "%"},
		})
	}
	if t.Vitals.BloodGlucoseMgDl > 0 {
		components = append(components, map[string]any{
			"code":          map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "2339-0", "display": "Glucose [Mass/volume] in Blood"}}, "text": "Blood Glucose"},
			"valueQuantity": map[string]any{"value": t.Vitals.BloodGlucoseMgDl, "unit": "mg/dL", "system": "http://unitsofmeasure.org", "code": "mg/dL"},
		})
	}
	if t.Vitals.PainScore > 0 {
		components = append(components, map[string]any{
			"code":         map[string]any{"coding": []map[string]any{{"system": "http://loinc.org", "code": "72514-3", "display": "Pain severity"}}, "text": "Pain Score"},
			"valueInteger": t.Vitals.PainScore,
		})
	}
	if strings.TrimSpace(t.Vitals.Consciousness) != "" {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "Consciousness"},
			"valueString": strings.TrimSpace(t.Vitals.Consciousness),
		})
	}

	if len(t.RedFlags) > 0 {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "Red Flags"},
			"valueString": strings.Join(t.RedFlags, ", "),
		})
	}

	if len(t.Context.ChronicConditions) > 0 {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "Chronic Conditions"},
			"valueString": strings.Join(t.Context.ChronicConditions, ", "),
		})
	}
	if t.Context.Pregnant {
		components = append(components, map[string]any{
			"code":         map[string]any{"text": "Pregnancy"},
			"valueBoolean": true,
		})
	}
	if strings.TrimSpace(t.Context.ChiefComplaint) != "" {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "Chief Complaint"},
			"valueString": strings.TrimSpace(t.Context.ChiefComplaint),
		})
	}

	if t.AISeverity != "" {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "AI Severity"},
			"valueString": t.AISeverity,
		})
		components = append(components, map[string]any{
			"code":         map[string]any{"text": "AI Confidence"},
			"valueDecimal": t.AIConfidence,
		})
	}

	if len(t.Suggestions) > 0 {
		components = append(components, map[string]any{
			"code":        map[string]any{"text": "Clinical Suggestions"},
			"valueString": strings.Join(t.Suggestions, " | "),
		})
	}

	return map[string]any{
		"resourceType":      "Observation",
		"id":                t.ID,
		"status":            "final",
		"category":          []map[string]any{{"coding": []map[string]any{{"system": "http://terminology.hl7.org/CodeSystem/observation-category", "code": "survey"}}, "text": "Triage"}},
		"code":              map[string]any{"text": "Front-door Triage Score"},
		"subject":           map[string]any{"reference": "Patient/" + t.PatientLogicalID},
		"effectiveDateTime": t.CreatedAt,
		"valueInteger":      t.Score,
		"component":         components,
	}
}

func appointmentStatusToFHIR(status string) string {
	switch status {
	case "booked":
		return "booked"
	case "arrived":
		return "arrived"
	case "completed":
		return "fulfilled"
	case "cancelled":
		return "cancelled"
	case "no-show":
		return "noshow"
	default:
		return "pending"
	}
}

func slotStatusToFHIR(status string) string {
	switch status {
	case "available":
		return "free"
	case "busy":
		return "busy"
	default:
		return "busy-unavailable"
	}
}

func queueStatusToTaskStatus(status string) string {
	switch status {
	case "waiting":
		return "requested"
	case "checked-in":
		return "in-progress"
	case "in-progress":
		return "in-progress"
	case "completed":
		return "completed"
	default:
		return "requested"
	}
}

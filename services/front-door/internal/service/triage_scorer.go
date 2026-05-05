package service

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

//////////////////////////////////////////////////////////////////
// REGISTRY CLIENT (THIS WAS MISSING)
//////////////////////////////////////////////////////////////////

type RegistryClient interface {
    GetService(ctx context.Context, name string) (string, error)
    // Add these:
    SearchPatients(query string, limit, offset int, sort string) (any, error)
    SearchOrganizations(query string, limit, offset int, sort string) (any, error)
    SearchPractitioners(query string, limit, offset int, sort string) (any, error)
}

type httpRegistryClient struct {
	baseURL string
	client  *http.Client
}

func (r *httpRegistryClient) SearchPatients(query string, limit, offset int, sort string) (any, error) {
    return r.doSearch(context.Background(), "patients", query, limit, offset, sort)
}

func (r *httpRegistryClient) SearchOrganizations(query string, limit, offset int, sort string) (any, error) {
    return r.doSearch(context.Background(), "organizations", query, limit, offset, sort)
}

func (r *httpRegistryClient) SearchPractitioners(query string, limit, offset int, sort string) (any, error) {
    return r.doSearch(context.Background(), "practitioners", query, limit, offset, sort)
}

// Helper method to avoid code duplication
func (r *httpRegistryClient) doSearch(ctx context.Context, resource, query string, limit, offset int, sort string) (any, error) {
    req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/%s", r.baseURL, resource), nil)
    if err != nil {
        return nil, err
    }

    // Add query parameters
    q := req.URL.Query()
    q.Add("q", query)
    q.Add("limit", strconv.Itoa(limit))
    q.Add("offset", strconv.Itoa(offset))
    q.Add("sort", sort)
    req.URL.RawQuery = q.Encode()

    resp, err := r.client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("registry search returned status %d", resp.StatusCode)
    }

    var result any
    if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
        return nil, err
    }
    return result, nil
}

func NewRegistryClient(baseURL string) RegistryClient {
	timeout := 2 * time.Second

	return &httpRegistryClient{
		baseURL: strings.TrimRight(baseURL, "/"),
		client:  &http.Client{Timeout: timeout},
	}
}

func (r *httpRegistryClient) GetService(ctx context.Context, name string) (string, error) {
	url := fmt.Sprintf("%s/services/%s", r.baseURL, name)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", err
	}

	resp, err := r.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return "", fmt.Errorf("registry returned status %d", resp.StatusCode)
	}

	var payload struct {
		URL string `json:"url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return "", err
	}

	if strings.TrimSpace(payload.URL) == "" {
		return "", errors.New("registry response missing url")
	}

	return payload.URL, nil
}

//////////////////////////////////////////////////////////////////
// TRIAGE SCORER (YOUR ORIGINAL CODE)
//////////////////////////////////////////////////////////////////

type TriageScoreInput struct {
	Symptoms []string
	RedFlags []string
	AgeYears int
	Channel  string
	Vitals   map[string]any
	Context  map[string]any
}

type TriageScoreResult struct {
	AISeverity    string
	AIScore       int
	Confidence    float64
	RuleSeverity  string
	FinalSeverity string
	FallbackUsed  bool
	ModelVersion  string
	Reasons       []string
	Suggestions   []string
}

type TriageScorer interface {
	Score(ctx context.Context, in TriageScoreInput) (TriageScoreResult, error)
}

type httpTriageScorer struct {
	baseURL string
	client  *http.Client
}

func newTriageScorerFromEnv() TriageScorer {
	baseURL := strings.TrimSpace(os.Getenv("TRIAGE_AI_SCORER_URL"))
	if baseURL == "" {
		return nil
	}

	timeout := 1500 * time.Millisecond
	if raw := strings.TrimSpace(os.Getenv("TRIAGE_AI_TIMEOUT_MS")); raw != "" {
		if ms, err := strconv.Atoi(raw); err == nil && ms > 0 {
			timeout = time.Duration(ms) * time.Millisecond
		}
	}

	return newTriageScorerWithConfig(baseURL, timeout)
}

func newTriageScorerWithConfig(baseURL string, timeout time.Duration) TriageScorer {
	return &httpTriageScorer{
		baseURL: strings.TrimRight(baseURL, "/"),
		client:  &http.Client{Timeout: timeout},
	}
}

func (s *httpTriageScorer) Score(ctx context.Context, in TriageScoreInput) (TriageScoreResult, error) {
	body, err := json.Marshal(map[string]any{
		"symptoms": in.Symptoms,
		"redFlags": in.RedFlags,
		"ageYears": in.AgeYears,
		"channel":  normalizeChannel(in.Channel),
		"vitals":   in.Vitals,
		"context":  in.Context,
	})
	if err != nil {
		return TriageScoreResult{}, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, s.baseURL+"/score", bytes.NewReader(body))
	if err != nil {
		return TriageScoreResult{}, err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.client.Do(req)
	if err != nil {
		return TriageScoreResult{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return TriageScoreResult{}, fmt.Errorf("ai scorer returned status %d", resp.StatusCode)
	}

	var payload struct {
		AISeverity    string   `json:"aiSeverity"`
		AIScore       int      `json:"aiScore"`
		Confidence    float64  `json:"confidence"`
		RuleSeverity  string   `json:"ruleSeverity"`
		FinalSeverity string   `json:"finalSeverity"`
		FallbackUsed  bool     `json:"fallbackUsed"`
		ModelVersion  string   `json:"modelVersion"`
		Reasons       []string `json:"reasons"`
		Suggestions   []string `json:"suggestions"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return TriageScoreResult{}, err
	}

	if strings.TrimSpace(payload.FinalSeverity) == "" {
		return TriageScoreResult{}, errors.New("ai scorer response missing finalSeverity")
	}

	return TriageScoreResult{
		AISeverity:    payload.AISeverity,
		AIScore:       payload.AIScore,
		Confidence:    payload.Confidence,
		RuleSeverity:  payload.RuleSeverity,
		FinalSeverity: payload.FinalSeverity,
		FallbackUsed:  payload.FallbackUsed,
		ModelVersion:  payload.ModelVersion,
		Reasons:       payload.Reasons,
		Suggestions:   payload.Suggestions,
	}, nil
}

func normalizeChannel(channel string) string {
	switch strings.ToLower(strings.TrimSpace(channel)) {
	case "web", "mobile", "ussd":
		return strings.ToLower(strings.TrimSpace(channel))
	default:
		return "unknown"
	}
}

func probeTriageScorer(ctx context.Context, baseURL string, timeout time.Duration) error {
	client := &http.Client{Timeout: timeout}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, strings.TrimRight(baseURL, "/")+"/healthz", nil)
	if err != nil {
		return err
	}

	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("scorer health check failed with status %d", resp.StatusCode)
	}

	return nil
}

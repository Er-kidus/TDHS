package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"

	"github.com/tenadam/api-gateway/config"
	"github.com/tenadam/api-gateway/internal/repository"
	"github.com/tenadam/api-gateway/internal/service"
)

type Handler struct {
	cfg  *config.Config
	svcs *service.Services
}

func New(cfg *config.Config, svcs *service.Services) *Handler {
	return &Handler{cfg: cfg, svcs: svcs}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	h.writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "api-gateway"})
}

type ctxKey string

const (
	ctxKeySubject ctxKey = "sub"
	ctxKeyType    ctxKey = "typ"
	ctxKeyRole    ctxKey = "role"
	ctxKeyEmail   ctxKey = "email"
	ctxKeyOrgID   ctxKey = "org_id"
)

func (h *Handler) withAuth(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" {
			h.errorJSON(w, http.StatusUnauthorized, "missing Authorization header")
			return
		}
		parts := strings.SplitN(auth, " ", 2)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			h.errorJSON(w, http.StatusUnauthorized, "invalid Authorization header")
			return
		}
		claims, err := h.svcs.JWT.Verify(parts[1])
		if err != nil {
			h.errorJSON(w, http.StatusUnauthorized, "invalid token")
			return
		}
		ctx := context.WithValue(r.Context(), ctxKeySubject, claims.Subject)
		ctx = context.WithValue(ctx, ctxKeyType, claims.Type)
		ctx = context.WithValue(ctx, ctxKeyRole, claims.Role)
		ctx = context.WithValue(ctx, ctxKeyEmail, claims.Email)
		ctx = context.WithValue(ctx, ctxKeyOrgID, strings.TrimSpace(claims.OrgID))
		next(w, r.WithContext(ctx))
	}
}

func (h *Handler) RequirePatient(next http.HandlerFunc) http.HandlerFunc {
	return h.withAuth(func(w http.ResponseWriter, r *http.Request) {
		typ, _ := r.Context().Value(ctxKeyType).(service.TokenType)
		if typ != service.TokenTypePatient {
			h.errorJSON(w, http.StatusForbidden, "patient token required")
			return
		}
		next(w, r)
	})
}

func (h *Handler) RequireOrg(next http.HandlerFunc) http.HandlerFunc {
	return h.withAuth(func(w http.ResponseWriter, r *http.Request) {
		typ, _ := r.Context().Value(ctxKeyType).(service.TokenType)
		if typ != service.TokenTypeOrg {
			h.errorJSON(w, http.StatusForbidden, "org token required")
			return
		}
		next(w, r)
	})
}

func (h *Handler) RequireOrgAnyRole(roles ...string) func(http.HandlerFunc) http.HandlerFunc {
	allowed := make(map[string]struct{}, len(roles))
	for _, role := range roles {
		allowed[normalizeOrgRoleAlias(role)] = struct{}{}
	}
	return func(next http.HandlerFunc) http.HandlerFunc {
		return h.withAuth(func(w http.ResponseWriter, r *http.Request) {
			typ, _ := r.Context().Value(ctxKeyType).(service.TokenType)
			if typ != service.TokenTypeOrg {
				h.errorJSON(w, http.StatusForbidden, "org token required")
				return
			}
			role := normalizeOrgRoleAlias(roleName(r.Context()))
			if _, ok := allowed[role]; !ok {
				h.errorJSON(w, http.StatusForbidden, "insufficient role")
				return
			}
			next(w, r)
		})
	}
}

func normalizeOrgRoleAlias(role string) string {
	value := strings.ToLower(strings.TrimSpace(role))
	switch value {
	case "super_admin", "super-admin":
		return "superadmin"
	case "reception", "receptionist", "frontdesk", "front-desk", "front_desk", "clerk", "support", "lab", "laboratory", "pharmacist", "it":
		return "staff"
	case "physician", "consultant", "specialist", "medical-director", "medical_director", "resident", "surgeon", "obgyn":
		return "doctor"
	case "midwife", "triage-nurse", "triage_nurse", "staff-nurse", "staff_nurse", "icu-nurse", "icu_nurse":
		return "nurse"
	default:
		return value
	}
}

func (h *Handler) RequireOrgRole(role string) func(http.HandlerFunc) http.HandlerFunc {
	return h.RequireOrgAnyRole(role)
}

func (h *Handler) RequireAny(next http.HandlerFunc) http.HandlerFunc {
	return h.withAuth(next)
}

func subjectID(ctx context.Context) string {
	sub, _ := ctx.Value(ctxKeySubject).(string)
	return sub
}

func tokenType(ctx context.Context) service.TokenType {
	typ, _ := ctx.Value(ctxKeyType).(service.TokenType)
	return typ
}

func roleName(ctx context.Context) string {
	role, _ := ctx.Value(ctxKeyRole).(string)
	return role
}

func subjectEmail(ctx context.Context) string {
	email, _ := ctx.Value(ctxKeyEmail).(string)
	return strings.TrimSpace(strings.ToLower(email))
}

func subjectOrgID(ctx context.Context) string {
	orgID, _ := ctx.Value(ctxKeyOrgID).(string)
	return strings.TrimSpace(orgID)
}

func (h *Handler) readJSON(w http.ResponseWriter, r *http.Request, dst any) error {
	const maxBody = 1 << 20
	r.Body = http.MaxBytesReader(w, r.Body, maxBody)
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(dst); err != nil {
		if errors.Is(err, io.EOF) {
			return errors.New("empty body")
		}
		return err
	}
	return nil
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) errorJSON(w http.ResponseWriter, status int, message string) {
	h.writeJSON(w, status, map[string]any{"error": message})
}

func mapRepoErr(h *Handler, w http.ResponseWriter, err error) bool {
	if err == nil {
		return false
	}
	if errors.Is(err, repository.ErrNotFound) {
		h.errorJSON(w, http.StatusNotFound, "not found")
		return true
	}
	return false
}

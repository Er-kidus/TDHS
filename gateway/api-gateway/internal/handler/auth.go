package handler

import (
	"net/http"

	"github.com/tenadam/api-gateway/internal/repository"
	"github.com/tenadam/api-gateway/internal/service"
)

type patientRegisterRequest struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Phone    string `json:"phone"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type orgRegisterRequest struct {
	FullName string `json:"fullName"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) PatientRegister(w http.ResponseWriter, r *http.Request) {
	var req patientRegisterRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	res, err := h.svcs.Auth.RegisterPatient(r.Context(), service.PatientRegisterInput{
		FullName: req.FullName,
		Email:    req.Email,
		Password: req.Password,
		Phone:    req.Phone,
	})
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	h.writeJSON(w, http.StatusCreated, res)
}

func (h *Handler) PatientLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	res, err := h.svcs.Auth.LoginPatient(r.Context(), req.Email, req.Password)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		h.errorJSON(w, http.StatusUnauthorized, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, res)
}

func (h *Handler) OrgLogin(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}
	res, err := h.svcs.Auth.LoginOrg(r.Context(), req.Email, req.Password)
	if err != nil {
		if err == repository.ErrNotFound {
			h.errorJSON(w, http.StatusUnauthorized, "invalid credentials")
			return
		}
		h.errorJSON(w, http.StatusUnauthorized, err.Error())
		return
	}
	h.writeJSON(w, http.StatusOK, res)
}

func (h *Handler) OrgRegister(w http.ResponseWriter, r *http.Request) {
	var req orgRegisterRequest
	if err := h.readJSON(w, r, &req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	res, err := h.svcs.Auth.RegisterOrg(r.Context(), service.OrgRegisterInput{
		FullName: req.FullName,
		Email:    req.Email,
		Password: req.Password,
	})
	if err != nil {
		h.errorJSON(w, http.StatusBadRequest, err.Error())
		return
	}

	h.writeJSON(w, http.StatusCreated, res)
}

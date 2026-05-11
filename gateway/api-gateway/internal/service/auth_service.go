package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo *repository.Repository
	jwt  *JWTService
}

func NewAuthService(repo *repository.Repository, jwtSvc *JWTService) *AuthService {
	return &AuthService{repo: repo, jwt: jwtSvc}
}

type PatientRegisterInput struct {
	FullName string
	Email    string
	Password string
	Phone    string
}

type OrgRegisterInput struct {
	FullName string
	Email    string
	Password string
}

type AuthResult[T any] struct {
	Token string `json:"token"`
	Data  T      `json:"data"`
}

func (s *AuthService) RegisterPatient(ctx context.Context, in PatientRegisterInput) (*AuthResult[*model.Patient], error) {
	if in.FullName == "" || in.Email == "" || in.Password == "" || in.Phone == "" {
		return nil, errors.New("missing required fields")
	}
	pwHashBytes, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	profile := map[string]any{
		"resourceType": "Patient",
		"active":       true,
		"name": []any{
			map[string]any{"text": in.FullName},
		},
		"telecom": []any{
			map[string]any{"system": "email", "value": in.Email},
			map[string]any{"system": "phone", "value": in.Phone},
		},
		"deceasedBoolean":      false,
		"multipleBirthBoolean": false,
	}

	patient, err := s.repo.CreatePatient(ctx, in.FullName, in.Email, in.Phone, string(pwHashBytes), profile)
	if err != nil {
		return nil, err
	}
	jwtToken, err := s.jwt.Sign(patient.ID, TokenTypePatient, "", patient.Email, "", 24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &AuthResult[*model.Patient]{Token: jwtToken, Data: patient}, nil
}

func (s *AuthService) LoginPatient(ctx context.Context, email, password string) (*AuthResult[*model.Patient], error) {
	patient, pwHash, err := s.repo.GetPatientByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}
	jwtToken, err := s.jwt.Sign(patient.ID, TokenTypePatient, "", patient.Email, "", 24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &AuthResult[*model.Patient]{Token: jwtToken, Data: patient}, nil
}

func (s *AuthService) LoginOrg(ctx context.Context, email, password string) (*AuthResult[*model.User], error) {
	user, pwHash, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(pwHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}
	orgID := ""
	if user.OrganizationID != nil {
		orgID = *user.OrganizationID
	}
	jwtToken, err := s.jwt.Sign(user.ID, TokenTypeOrg, user.Role, user.Email, orgID, 24*time.Hour)
	if err != nil {
		return nil, err
	}
	return &AuthResult[*model.User]{Token: jwtToken, Data: user}, nil
}

func (s *AuthService) RegisterOrg(ctx context.Context, in OrgRegisterInput) (*AuthResult[*model.User], error) {
	if in.FullName == "" || in.Email == "" || in.Password == "" {
		return nil, errors.New("missing required fields")
	}

	email := strings.TrimSpace(strings.ToLower(in.Email))
	if email == "" {
		return nil, errors.New("email is required")
	}

	pwHashBytes, err := bcrypt.GenerateFromPassword([]byte(in.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	if _, err := s.repo.CreateOrgUser(ctx, strings.TrimSpace(in.FullName), email, string(pwHashBytes), "admin"); err != nil {
		return nil, err
	}

	user, _, err := s.repo.GetUserByEmail(ctx, email)
	if err != nil {
		return nil, err
	}

	orgID := ""
	if user.OrganizationID != nil {
		orgID = *user.OrganizationID
	}
	jwtToken, err := s.jwt.Sign(user.ID, TokenTypeOrg, user.Role, user.Email, orgID, 24*time.Hour)
	if err != nil {
		return nil, err
	}

	return &AuthResult[*model.User]{Token: jwtToken, Data: user}, nil
}

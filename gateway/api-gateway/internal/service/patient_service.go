package service

import (
	"context"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type PatientService struct {
	repo *repository.Repository
}

func NewPatientService(repo *repository.Repository) *PatientService {
	return &PatientService{repo: repo}
}

func (s *PatientService) GetByID(ctx context.Context, id string) (*model.Patient, error) {
	return s.repo.GetPatientByID(ctx, id)
}

func (s *PatientService) UpdateProfileMerge(ctx context.Context, id, fullName, email, phone string, profilePatch map[string]any) (*model.Patient, error) {
	return s.repo.UpdatePatientProfileMerge(ctx, id, fullName, email, phone, profilePatch)
}

func (s *PatientService) List(ctx context.Context, limit int) ([]*model.Patient, error) {
	return s.repo.ListPatients(ctx, limit)
}

func (s *PatientService) ListByOrganization(ctx context.Context, organizationID string, limit int) ([]*model.Patient, error) {
	return s.repo.ListPatientsByOrganization(ctx, organizationID, limit)
}

func (s *PatientService) GetByIDForOrganization(ctx context.Context, patientID, organizationID string) (*model.Patient, error) {
	return s.repo.GetPatientByIDForOrganization(ctx, patientID, organizationID)
}

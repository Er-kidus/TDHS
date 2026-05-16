package service

import (
	"context"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type PharmacyService struct {
	repo *repository.Repository
}

func NewPharmacyService(repo *repository.Repository) *PharmacyService {
	return &PharmacyService{repo: repo}
}

func (s *PharmacyService) ListMedications(ctx context.Context, q string, limit int) ([]*model.Medication, error) {
	return s.repo.ListMedications(ctx, q, limit)
}

func (s *PharmacyService) OrgUpdateInventory(ctx context.Context, orgID, medID string, stockLevel, reorderLevel int, unitPrice float64, status string) (*model.PharmacyInventory, error) {
	return s.repo.OrgUpdateInventory(ctx, orgID, medID, stockLevel, reorderLevel, unitPrice, status)
}

func (s *PharmacyService) OrgListInventory(ctx context.Context, orgID string, limit int) ([]*model.PharmacyInventory, error) {
	return s.repo.OrgListInventory(ctx, orgID, limit)
}

func (s *PharmacyService) PatientSearchPharmacies(ctx context.Context, medID string, lat, lng float64) ([]map[string]any, error) {
	return s.repo.PatientSearchPharmaciesMap(ctx, medID, lat, lng)
}

func (s *PharmacyService) OrgLogFulfillment(ctx context.Context, orgID, pharmacistID, rxID, patID, medID string, qty int, notes string) (*model.PrescriptionFulfillment, error) {
	return s.repo.OrgLogFulfillment(ctx, orgID, pharmacistID, rxID, patID, medID, qty, notes)
}

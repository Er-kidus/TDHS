package service

import (
	"context"
	"github.com/tenadam/audit-service/internal/dto"
	"github.com/tenadam/audit-service/internal/model"
	"github.com/tenadam/audit-service/internal/validator"
)

// CreateAudit validates and creates a new audit.
func (s *Service) CreateAudit(ctx context.Context, req dto.CreateAuditRequest) (*dto.AuditResponse, error) {
	if err := validator.ValidateAuditCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Audit{}
	created, err := s.repo.CreateAudit(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuditResponse{ID: created.ID}, nil
}

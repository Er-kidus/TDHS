package service

import (
	"context"
	"github.com/tenadam/audit-service/internal/dto"
	"github.com/tenadam/audit-service/internal/model"
	"github.com/tenadam/audit-service/internal/validator"
)

// UpdateAudit validates and updates an existing audit.
func (s *Service) UpdateAudit(ctx context.Context, req dto.UpdateAuditRequest) (*dto.AuditResponse, error) {
	if err := validator.ValidateAuditUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Audit{ID: req.ID}
	updated, err := s.repo.UpdateAudit(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuditResponse{ID: updated.ID}, nil
}

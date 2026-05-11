package service

import (
	"context"
	"github.com/tenadam/audit-service/internal/dto"
)

// GetAudit retrieves a single audit by ID.
func (s *Service) GetAudit(ctx context.Context, id string) (*dto.AuditResponse, error) {
	entity, err := s.repo.GetAudit(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AuditResponse{ID: entity.ID}, nil
}

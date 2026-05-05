package service

import (
	"context"
	"github.com/tenadam/audit-service/internal/dto"
)

// ListAudits retrieves all audits.
func (s *Service) ListAudits(ctx context.Context) (*dto.ListAuditResponse, error) {
	entities, err := s.repo.ListAudits(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AuditResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AuditResponse{ID: e.ID})
	}
	return &dto.ListAuditResponse{Items: items, Total: len(items)}, nil
}

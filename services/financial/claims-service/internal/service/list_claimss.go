package service

import (
	"context"
	"github.com/tenadam/claims-service/internal/dto"
)

// ListClaimss retrieves all claimss.
func (s *Service) ListClaimss(ctx context.Context) (*dto.ListClaimsResponse, error) {
	entities, err := s.repo.ListClaimss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ClaimsResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ClaimsResponse{ID: e.ID})
	}
	return &dto.ListClaimsResponse{Items: items, Total: len(items)}, nil
}

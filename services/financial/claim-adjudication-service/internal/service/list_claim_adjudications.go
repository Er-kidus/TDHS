package service

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
)

// ListClaimAdjudications retrieves all claim-adjudications.
func (s *Service) ListClaimAdjudications(ctx context.Context) (*dto.ListClaimAdjudicationResponse, error) {
	entities, err := s.repo.ListClaimAdjudications(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ClaimAdjudicationResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ClaimAdjudicationResponse{ID: e.ID})
	}
	return &dto.ListClaimAdjudicationResponse{Items: items, Total: len(items)}, nil
}

package service

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
)

// GetClaimAdjudication retrieves a single claim-adjudication by ID.
func (s *Service) GetClaimAdjudication(ctx context.Context, id string) (*dto.ClaimAdjudicationResponse, error) {
	entity, err := s.repo.GetClaimAdjudication(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ClaimAdjudicationResponse{ID: entity.ID}, nil
}

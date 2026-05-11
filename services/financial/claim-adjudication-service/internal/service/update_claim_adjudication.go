package service

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
	"github.com/tenadam/claim-adjudication-service/internal/model"
	"github.com/tenadam/claim-adjudication-service/internal/validator"
)

// UpdateClaimAdjudication validates and updates an existing claim-adjudication.
func (s *Service) UpdateClaimAdjudication(ctx context.Context, req dto.UpdateClaimAdjudicationRequest) (*dto.ClaimAdjudicationResponse, error) {
	if err := validator.ValidateClaimAdjudicationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ClaimAdjudication{ID: req.ID}
	updated, err := s.repo.UpdateClaimAdjudication(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClaimAdjudicationResponse{ID: updated.ID}, nil
}

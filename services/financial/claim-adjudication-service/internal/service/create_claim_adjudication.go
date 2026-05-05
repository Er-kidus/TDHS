package service

import (
	"context"
	"github.com/tenadam/claim-adjudication-service/internal/dto"
	"github.com/tenadam/claim-adjudication-service/internal/model"
	"github.com/tenadam/claim-adjudication-service/internal/validator"
)

// CreateClaimAdjudication validates and creates a new claim-adjudication.
func (s *Service) CreateClaimAdjudication(ctx context.Context, req dto.CreateClaimAdjudicationRequest) (*dto.ClaimAdjudicationResponse, error) {
	if err := validator.ValidateClaimAdjudicationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ClaimAdjudication{}
	created, err := s.repo.CreateClaimAdjudication(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClaimAdjudicationResponse{ID: created.ID}, nil
}

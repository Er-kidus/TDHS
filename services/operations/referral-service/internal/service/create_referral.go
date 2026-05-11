package service

import (
	"context"
	"github.com/tenadam/referral-service/internal/dto"
	"github.com/tenadam/referral-service/internal/model"
	"github.com/tenadam/referral-service/internal/validator"
)

// CreateReferral validates and creates a new referral.
func (s *Service) CreateReferral(ctx context.Context, req dto.CreateReferralRequest) (*dto.ReferralResponse, error) {
	if err := validator.ValidateReferralCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Referral{}
	created, err := s.repo.CreateReferral(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ReferralResponse{ID: created.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/referral-service/internal/dto"
	"github.com/tenadam/referral-service/internal/model"
	"github.com/tenadam/referral-service/internal/validator"
)

// UpdateReferral validates and updates an existing referral.
func (s *Service) UpdateReferral(ctx context.Context, req dto.UpdateReferralRequest) (*dto.ReferralResponse, error) {
	if err := validator.ValidateReferralUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Referral{ID: req.ID}
	updated, err := s.repo.UpdateReferral(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ReferralResponse{ID: updated.ID}, nil
}

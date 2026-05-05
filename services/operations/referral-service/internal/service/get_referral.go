package service

import (
	"context"
	"github.com/tenadam/referral-service/internal/dto"
)

// GetReferral retrieves a single referral by ID.
func (s *Service) GetReferral(ctx context.Context, id string) (*dto.ReferralResponse, error) {
	entity, err := s.repo.GetReferral(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ReferralResponse{ID: entity.ID}, nil
}

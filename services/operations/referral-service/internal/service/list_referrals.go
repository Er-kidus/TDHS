package service

import (
	"context"
	"github.com/tenadam/referral-service/internal/dto"
)

// ListReferrals retrieves all referrals.
func (s *Service) ListReferrals(ctx context.Context) (*dto.ListReferralResponse, error) {
	entities, err := s.repo.ListReferrals(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ReferralResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ReferralResponse{ID: e.ID})
	}
	return &dto.ListReferralResponse{Items: items, Total: len(items)}, nil
}

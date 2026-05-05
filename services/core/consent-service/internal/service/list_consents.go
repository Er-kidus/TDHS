package service

import (
	"context"
	"github.com/tenadam/consent-service/internal/dto"
)

// ListConsents retrieves all consents.
func (s *Service) ListConsents(ctx context.Context) (*dto.ListConsentResponse, error) {
	entities, err := s.repo.ListConsents(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ConsentResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ConsentResponse{ID: e.ID})
	}
	return &dto.ListConsentResponse{Items: items, Total: len(items)}, nil
}

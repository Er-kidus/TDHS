package service

import (
	"context"
	"github.com/tenadam/consent-service/internal/dto"
	"github.com/tenadam/consent-service/internal/model"
	"github.com/tenadam/consent-service/internal/validator"
)

// UpdateConsent validates and updates an existing consent.
func (s *Service) UpdateConsent(ctx context.Context, req dto.UpdateConsentRequest) (*dto.ConsentResponse, error) {
	if err := validator.ValidateConsentUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Consent{ID: req.ID}
	updated, err := s.repo.UpdateConsent(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ConsentResponse{ID: updated.ID}, nil
}

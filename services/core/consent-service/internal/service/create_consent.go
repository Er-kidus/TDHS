package service

import (
	"context"
	"github.com/tenadam/consent-service/internal/dto"
	"github.com/tenadam/consent-service/internal/model"
	"github.com/tenadam/consent-service/internal/validator"
)

// CreateConsent validates and creates a new consent.
func (s *Service) CreateConsent(ctx context.Context, req dto.CreateConsentRequest) (*dto.ConsentResponse, error) {
	if err := validator.ValidateConsentCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Consent{}
	created, err := s.repo.CreateConsent(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ConsentResponse{ID: created.ID}, nil
}

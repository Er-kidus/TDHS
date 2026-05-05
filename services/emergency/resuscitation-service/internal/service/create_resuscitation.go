package service

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/dto"
	"github.com/tenadam/resuscitation-service/internal/model"
	"github.com/tenadam/resuscitation-service/internal/validator"
)

// CreateResuscitation validates and creates a new resuscitation.
func (s *Service) CreateResuscitation(ctx context.Context, req dto.CreateResuscitationRequest) (*dto.ResuscitationResponse, error) {
	if err := validator.ValidateResuscitationCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Resuscitation{}
	created, err := s.repo.CreateResuscitation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ResuscitationResponse{ID: created.ID}, nil
}

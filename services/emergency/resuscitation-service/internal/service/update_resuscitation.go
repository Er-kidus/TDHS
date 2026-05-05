package service

import (
	"context"
	"github.com/tenadam/resuscitation-service/internal/dto"
	"github.com/tenadam/resuscitation-service/internal/model"
	"github.com/tenadam/resuscitation-service/internal/validator"
)

// UpdateResuscitation validates and updates an existing resuscitation.
func (s *Service) UpdateResuscitation(ctx context.Context, req dto.UpdateResuscitationRequest) (*dto.ResuscitationResponse, error) {
	if err := validator.ValidateResuscitationUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Resuscitation{ID: req.ID}
	updated, err := s.repo.UpdateResuscitation(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ResuscitationResponse{ID: updated.ID}, nil
}

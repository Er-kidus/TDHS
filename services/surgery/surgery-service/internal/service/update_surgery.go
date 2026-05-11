package service

import (
	"context"
	"github.com/tenadam/surgery-service/internal/dto"
	"github.com/tenadam/surgery-service/internal/model"
	"github.com/tenadam/surgery-service/internal/validator"
)

// UpdateSurgery validates and updates an existing surgery.
func (s *Service) UpdateSurgery(ctx context.Context, req dto.UpdateSurgeryRequest) (*dto.SurgeryResponse, error) {
	if err := validator.ValidateSurgeryUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Surgery{ID: req.ID}
	updated, err := s.repo.UpdateSurgery(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgeryResponse{ID: updated.ID}, nil
}

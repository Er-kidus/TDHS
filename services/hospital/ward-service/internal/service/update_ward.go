package service

import (
	"context"
	"github.com/tenadam/ward-service/internal/dto"
	"github.com/tenadam/ward-service/internal/model"
	"github.com/tenadam/ward-service/internal/validator"
)

// UpdateWard validates and updates an existing ward.
func (s *Service) UpdateWard(ctx context.Context, req dto.UpdateWardRequest) (*dto.WardResponse, error) {
	if err := validator.ValidateWardUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Ward{ID: req.ID}
	updated, err := s.repo.UpdateWard(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.WardResponse{ID: updated.ID}, nil
}

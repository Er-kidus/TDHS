package service

import (
	"context"
	"github.com/tenadam/nursing-service/internal/dto"
	"github.com/tenadam/nursing-service/internal/model"
	"github.com/tenadam/nursing-service/internal/validator"
)

// UpdateNursing validates and updates an existing nursing.
func (s *Service) UpdateNursing(ctx context.Context, req dto.UpdateNursingRequest) (*dto.NursingResponse, error) {
	if err := validator.ValidateNursingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Nursing{ID: req.ID}
	updated, err := s.repo.UpdateNursing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingResponse{ID: updated.ID}, nil
}

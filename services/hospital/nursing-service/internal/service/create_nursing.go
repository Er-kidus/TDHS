package service

import (
	"context"
	"github.com/tenadam/nursing-service/internal/dto"
	"github.com/tenadam/nursing-service/internal/model"
	"github.com/tenadam/nursing-service/internal/validator"
)

// CreateNursing validates and creates a new nursing.
func (s *Service) CreateNursing(ctx context.Context, req dto.CreateNursingRequest) (*dto.NursingResponse, error) {
	if err := validator.ValidateNursingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Nursing{}
	created, err := s.repo.CreateNursing(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.NursingResponse{ID: created.ID}, nil
}

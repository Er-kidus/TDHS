package service

import (
	"context"
	"github.com/tenadam/surgery-service/internal/dto"
	"github.com/tenadam/surgery-service/internal/model"
	"github.com/tenadam/surgery-service/internal/validator"
)

// CreateSurgery validates and creates a new surgery.
func (s *Service) CreateSurgery(ctx context.Context, req dto.CreateSurgeryRequest) (*dto.SurgeryResponse, error) {
	if err := validator.ValidateSurgeryCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Surgery{}
	created, err := s.repo.CreateSurgery(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgeryResponse{ID: created.ID}, nil
}

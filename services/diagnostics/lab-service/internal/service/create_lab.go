package service

import (
	"context"
	"github.com/tenadam/lab-service/internal/dto"
	"github.com/tenadam/lab-service/internal/model"
	"github.com/tenadam/lab-service/internal/validator"
)

// CreateLab validates and creates a new lab.
func (s *Service) CreateLab(ctx context.Context, req dto.CreateLabRequest) (*dto.LabResponse, error) {
	if err := validator.ValidateLabCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Lab{}
	created, err := s.repo.CreateLab(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.LabResponse{ID: created.ID}, nil
}

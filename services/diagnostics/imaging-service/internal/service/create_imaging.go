package service

import (
	"context"
	"github.com/tenadam/imaging-service/internal/dto"
	"github.com/tenadam/imaging-service/internal/model"
	"github.com/tenadam/imaging-service/internal/validator"
)

// CreateImaging validates and creates a new imaging.
func (s *Service) CreateImaging(ctx context.Context, req dto.CreateImagingRequest) (*dto.ImagingResponse, error) {
	if err := validator.ValidateImagingCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Imaging{}
	created, err := s.repo.CreateImaging(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ImagingResponse{ID: created.ID}, nil
}

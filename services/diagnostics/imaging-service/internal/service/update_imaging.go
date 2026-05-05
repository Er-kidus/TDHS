package service

import (
	"context"
	"github.com/tenadam/imaging-service/internal/dto"
	"github.com/tenadam/imaging-service/internal/model"
	"github.com/tenadam/imaging-service/internal/validator"
)

// UpdateImaging validates and updates an existing imaging.
func (s *Service) UpdateImaging(ctx context.Context, req dto.UpdateImagingRequest) (*dto.ImagingResponse, error) {
	if err := validator.ValidateImagingUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Imaging{ID: req.ID}
	updated, err := s.repo.UpdateImaging(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ImagingResponse{ID: updated.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/icu-service/internal/dto"
	"github.com/tenadam/icu-service/internal/model"
	"github.com/tenadam/icu-service/internal/validator"
)

// UpdateIcu validates and updates an existing icu.
func (s *Service) UpdateIcu(ctx context.Context, req dto.UpdateIcuRequest) (*dto.IcuResponse, error) {
	if err := validator.ValidateIcuUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Icu{ID: req.ID}
	updated, err := s.repo.UpdateIcu(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IcuResponse{ID: updated.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/icu-service/internal/dto"
	"github.com/tenadam/icu-service/internal/model"
	"github.com/tenadam/icu-service/internal/validator"
)

// CreateIcu validates and creates a new icu.
func (s *Service) CreateIcu(ctx context.Context, req dto.CreateIcuRequest) (*dto.IcuResponse, error) {
	if err := validator.ValidateIcuCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Icu{}
	created, err := s.repo.CreateIcu(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.IcuResponse{ID: created.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/result-service/internal/dto"
	"github.com/tenadam/result-service/internal/model"
	"github.com/tenadam/result-service/internal/validator"
)

// CreateResult validates and creates a new result.
func (s *Service) CreateResult(ctx context.Context, req dto.CreateResultRequest) (*dto.ResultResponse, error) {
	if err := validator.ValidateResultCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Result{}
	created, err := s.repo.CreateResult(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ResultResponse{ID: created.ID}, nil
}

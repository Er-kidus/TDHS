package service

import (
	"context"
	"github.com/tenadam/result-service/internal/dto"
	"github.com/tenadam/result-service/internal/model"
	"github.com/tenadam/result-service/internal/validator"
)

// UpdateResult validates and updates an existing result.
func (s *Service) UpdateResult(ctx context.Context, req dto.UpdateResultRequest) (*dto.ResultResponse, error) {
	if err := validator.ValidateResultUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Result{ID: req.ID}
	updated, err := s.repo.UpdateResult(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ResultResponse{ID: updated.ID}, nil
}

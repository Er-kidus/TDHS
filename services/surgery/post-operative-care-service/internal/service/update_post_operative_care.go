package service

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/dto"
	"github.com/tenadam/post-operative-care-service/internal/model"
	"github.com/tenadam/post-operative-care-service/internal/validator"
)

// UpdatePostOperativeCare validates and updates an existing post-operative-care.
func (s *Service) UpdatePostOperativeCare(ctx context.Context, req dto.UpdatePostOperativeCareRequest) (*dto.PostOperativeCareResponse, error) {
	if err := validator.ValidatePostOperativeCareUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.PostOperativeCare{ID: req.ID}
	updated, err := s.repo.UpdatePostOperativeCare(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PostOperativeCareResponse{ID: updated.ID}, nil
}

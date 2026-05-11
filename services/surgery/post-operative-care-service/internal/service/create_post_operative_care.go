package service

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/dto"
	"github.com/tenadam/post-operative-care-service/internal/model"
	"github.com/tenadam/post-operative-care-service/internal/validator"
)

// CreatePostOperativeCare validates and creates a new post-operative-care.
func (s *Service) CreatePostOperativeCare(ctx context.Context, req dto.CreatePostOperativeCareRequest) (*dto.PostOperativeCareResponse, error) {
	if err := validator.ValidatePostOperativeCareCreate(req); err != nil {
		return nil, err
	}
	entity := &model.PostOperativeCare{}
	created, err := s.repo.CreatePostOperativeCare(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.PostOperativeCareResponse{ID: created.ID}, nil
}

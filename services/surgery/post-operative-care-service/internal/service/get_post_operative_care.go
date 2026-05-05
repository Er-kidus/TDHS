package service

import (
	"context"
	"github.com/tenadam/post-operative-care-service/internal/dto"
)

// GetPostOperativeCare retrieves a single post-operative-care by ID.
func (s *Service) GetPostOperativeCare(ctx context.Context, id string) (*dto.PostOperativeCareResponse, error) {
	entity, err := s.repo.GetPostOperativeCare(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.PostOperativeCareResponse{ID: entity.ID}, nil
}

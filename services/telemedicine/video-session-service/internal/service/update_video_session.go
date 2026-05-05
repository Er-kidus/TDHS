package service

import (
	"context"
	"github.com/tenadam/video-session-service/internal/dto"
	"github.com/tenadam/video-session-service/internal/model"
	"github.com/tenadam/video-session-service/internal/validator"
)

// UpdateVideoSession validates and updates an existing video-session.
func (s *Service) UpdateVideoSession(ctx context.Context, req dto.UpdateVideoSessionRequest) (*dto.VideoSessionResponse, error) {
	if err := validator.ValidateVideoSessionUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.VideoSession{ID: req.ID}
	updated, err := s.repo.UpdateVideoSession(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VideoSessionResponse{ID: updated.ID}, nil
}

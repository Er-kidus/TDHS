package service

import (
	"context"
	"github.com/tenadam/session-service/internal/dto"
	"github.com/tenadam/session-service/internal/model"
	"github.com/tenadam/session-service/internal/validator"
)

// UpdateSession validates and updates an existing session.
func (s *Service) UpdateSession(ctx context.Context, req dto.UpdateSessionRequest) (*dto.SessionResponse, error) {
	if err := validator.ValidateSessionUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Session{ID: req.ID}
	updated, err := s.repo.UpdateSession(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SessionResponse{ID: updated.ID}, nil
}

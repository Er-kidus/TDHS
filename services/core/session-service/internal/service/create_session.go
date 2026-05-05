package service

import (
	"context"
	"github.com/tenadam/session-service/internal/dto"
	"github.com/tenadam/session-service/internal/model"
	"github.com/tenadam/session-service/internal/validator"
)

// CreateSession validates and creates a new session.
func (s *Service) CreateSession(ctx context.Context, req dto.CreateSessionRequest) (*dto.SessionResponse, error) {
	if err := validator.ValidateSessionCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Session{}
	created, err := s.repo.CreateSession(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SessionResponse{ID: created.ID}, nil
}

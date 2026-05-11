package service

import (
	"context"
	"github.com/tenadam/auth-service/internal/dto"
	"github.com/tenadam/auth-service/internal/model"
	"github.com/tenadam/auth-service/internal/validator"
)

// CreateAuth validates and creates a new auth.
func (s *Service) CreateAuth(ctx context.Context, req dto.CreateAuthRequest) (*dto.AuthResponse, error) {
	if err := validator.ValidateAuthCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Auth{}
	created, err := s.repo.CreateAuth(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{ID: created.ID}, nil
}

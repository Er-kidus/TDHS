package service

import (
	"context"
	"github.com/tenadam/auth-service/internal/dto"
	"github.com/tenadam/auth-service/internal/model"
	"github.com/tenadam/auth-service/internal/validator"
)

// UpdateAuth validates and updates an existing auth.
func (s *Service) UpdateAuth(ctx context.Context, req dto.UpdateAuthRequest) (*dto.AuthResponse, error) {
	if err := validator.ValidateAuthUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Auth{ID: req.ID}
	updated, err := s.repo.UpdateAuth(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AuthResponse{ID: updated.ID}, nil
}

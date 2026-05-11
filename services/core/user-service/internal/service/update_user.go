package service

import (
	"context"
	"github.com/tenadam/user-service/internal/dto"
	"github.com/tenadam/user-service/internal/model"
	"github.com/tenadam/user-service/internal/validator"
)

// UpdateUser validates and updates an existing user.
func (s *Service) UpdateUser(ctx context.Context, req dto.UpdateUserRequest) (*dto.UserResponse, error) {
	if err := validator.ValidateUserUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.User{ID: req.ID}
	updated, err := s.repo.UpdateUser(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.UserResponse{ID: updated.ID}, nil
}

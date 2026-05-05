package service

import (
	"context"
	"github.com/tenadam/user-service/internal/dto"
	"github.com/tenadam/user-service/internal/model"
	"github.com/tenadam/user-service/internal/validator"
)

// CreateUser validates and creates a new user.
func (s *Service) CreateUser(ctx context.Context, req dto.CreateUserRequest) (*dto.UserResponse, error) {
	if err := validator.ValidateUserCreate(req); err != nil {
		return nil, err
	}
	entity := &model.User{}
	created, err := s.repo.CreateUser(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.UserResponse{ID: created.ID}, nil
}

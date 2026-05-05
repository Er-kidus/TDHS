package service

import (
	"context"
	"github.com/tenadam/access-control-service/internal/dto"
	"github.com/tenadam/access-control-service/internal/model"
	"github.com/tenadam/access-control-service/internal/validator"
)

// CreateAccessControl validates and creates a new access-control.
func (s *Service) CreateAccessControl(ctx context.Context, req dto.CreateAccessControlRequest) (*dto.AccessControlResponse, error) {
	if err := validator.ValidateAccessControlCreate(req); err != nil {
		return nil, err
	}
	entity := &model.AccessControl{}
	created, err := s.repo.CreateAccessControl(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AccessControlResponse{ID: created.ID}, nil
}

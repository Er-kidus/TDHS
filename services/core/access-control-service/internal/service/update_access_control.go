package service

import (
	"context"
	"github.com/tenadam/access-control-service/internal/dto"
	"github.com/tenadam/access-control-service/internal/model"
	"github.com/tenadam/access-control-service/internal/validator"
)

// UpdateAccessControl validates and updates an existing access-control.
func (s *Service) UpdateAccessControl(ctx context.Context, req dto.UpdateAccessControlRequest) (*dto.AccessControlResponse, error) {
	if err := validator.ValidateAccessControlUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.AccessControl{ID: req.ID}
	updated, err := s.repo.UpdateAccessControl(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AccessControlResponse{ID: updated.ID}, nil
}

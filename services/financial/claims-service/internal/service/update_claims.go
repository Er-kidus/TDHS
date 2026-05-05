package service

import (
	"context"
	"github.com/tenadam/claims-service/internal/dto"
	"github.com/tenadam/claims-service/internal/model"
	"github.com/tenadam/claims-service/internal/validator"
)

// UpdateClaims validates and updates an existing claims.
func (s *Service) UpdateClaims(ctx context.Context, req dto.UpdateClaimsRequest) (*dto.ClaimsResponse, error) {
	if err := validator.ValidateClaimsUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Claims{ID: req.ID}
	updated, err := s.repo.UpdateClaims(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClaimsResponse{ID: updated.ID}, nil
}

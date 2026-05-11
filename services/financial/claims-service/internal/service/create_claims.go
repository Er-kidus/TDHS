package service

import (
	"context"
	"github.com/tenadam/claims-service/internal/dto"
	"github.com/tenadam/claims-service/internal/model"
	"github.com/tenadam/claims-service/internal/validator"
)

// CreateClaims validates and creates a new claims.
func (s *Service) CreateClaims(ctx context.Context, req dto.CreateClaimsRequest) (*dto.ClaimsResponse, error) {
	if err := validator.ValidateClaimsCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Claims{}
	created, err := s.repo.CreateClaims(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClaimsResponse{ID: created.ID}, nil
}

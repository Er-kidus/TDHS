package service

import (
	"context"
	"github.com/tenadam/ussd-service/internal/dto"
	"github.com/tenadam/ussd-service/internal/model"
	"github.com/tenadam/ussd-service/internal/validator"
)

// CreateUssd validates and creates a new ussd.
func (s *Service) CreateUssd(ctx context.Context, req dto.CreateUssdRequest) (*dto.UssdResponse, error) {
	if err := validator.ValidateUssdCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Ussd{}
	created, err := s.repo.CreateUssd(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.UssdResponse{ID: created.ID}, nil
}

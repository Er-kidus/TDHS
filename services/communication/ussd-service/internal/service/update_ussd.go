package service

import (
	"context"
	"github.com/tenadam/ussd-service/internal/dto"
	"github.com/tenadam/ussd-service/internal/model"
	"github.com/tenadam/ussd-service/internal/validator"
)

// UpdateUssd validates and updates an existing ussd.
func (s *Service) UpdateUssd(ctx context.Context, req dto.UpdateUssdRequest) (*dto.UssdResponse, error) {
	if err := validator.ValidateUssdUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Ussd{ID: req.ID}
	updated, err := s.repo.UpdateUssd(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.UssdResponse{ID: updated.ID}, nil
}

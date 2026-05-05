package service

import (
	"context"
	"github.com/tenadam/procurement-service/internal/dto"
	"github.com/tenadam/procurement-service/internal/model"
	"github.com/tenadam/procurement-service/internal/validator"
)

// UpdateProcurement validates and updates an existing procurement.
func (s *Service) UpdateProcurement(ctx context.Context, req dto.UpdateProcurementRequest) (*dto.ProcurementResponse, error) {
	if err := validator.ValidateProcurementUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Procurement{ID: req.ID}
	updated, err := s.repo.UpdateProcurement(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ProcurementResponse{ID: updated.ID}, nil
}

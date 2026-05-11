package service

import (
	"context"
	"github.com/tenadam/vendor-service/internal/dto"
	"github.com/tenadam/vendor-service/internal/model"
	"github.com/tenadam/vendor-service/internal/validator"
)

// UpdateVendor validates and updates an existing vendor.
func (s *Service) UpdateVendor(ctx context.Context, req dto.UpdateVendorRequest) (*dto.VendorResponse, error) {
	if err := validator.ValidateVendorUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Vendor{ID: req.ID}
	updated, err := s.repo.UpdateVendor(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VendorResponse{ID: updated.ID}, nil
}

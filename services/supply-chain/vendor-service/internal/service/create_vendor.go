package service

import (
	"context"
	"github.com/tenadam/vendor-service/internal/dto"
	"github.com/tenadam/vendor-service/internal/model"
	"github.com/tenadam/vendor-service/internal/validator"
)

// CreateVendor validates and creates a new vendor.
func (s *Service) CreateVendor(ctx context.Context, req dto.CreateVendorRequest) (*dto.VendorResponse, error) {
	if err := validator.ValidateVendorCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Vendor{}
	created, err := s.repo.CreateVendor(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VendorResponse{ID: created.ID}, nil
}

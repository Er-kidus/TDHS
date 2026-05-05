package service

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/dto"
	"github.com/tenadam/surgery-protocol-service/internal/model"
	"github.com/tenadam/surgery-protocol-service/internal/validator"
)

// UpdateSurgeryProtocol validates and updates an existing surgery-protocol.
func (s *Service) UpdateSurgeryProtocol(ctx context.Context, req dto.UpdateSurgeryProtocolRequest) (*dto.SurgeryProtocolResponse, error) {
	if err := validator.ValidateSurgeryProtocolUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.SurgeryProtocol{ID: req.ID}
	updated, err := s.repo.UpdateSurgeryProtocol(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgeryProtocolResponse{ID: updated.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/dto"
	"github.com/tenadam/surgery-protocol-service/internal/model"
	"github.com/tenadam/surgery-protocol-service/internal/validator"
)

// CreateSurgeryProtocol validates and creates a new surgery-protocol.
func (s *Service) CreateSurgeryProtocol(ctx context.Context, req dto.CreateSurgeryProtocolRequest) (*dto.SurgeryProtocolResponse, error) {
	if err := validator.ValidateSurgeryProtocolCreate(req); err != nil {
		return nil, err
	}
	entity := &model.SurgeryProtocol{}
	created, err := s.repo.CreateSurgeryProtocol(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.SurgeryProtocolResponse{ID: created.ID}, nil
}

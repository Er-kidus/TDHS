package service

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
	"github.com/tenadam/emergency-triage-protocol-service/internal/validator"
)

// CreateEmergencyTriageProtocol validates and creates a new emergency-triage-protocol.
func (s *Service) CreateEmergencyTriageProtocol(ctx context.Context, req dto.CreateEmergencyTriageProtocolRequest) (*dto.EmergencyTriageProtocolResponse, error) {
	if err := validator.ValidateEmergencyTriageProtocolCreate(req); err != nil {
		return nil, err
	}
	entity := &model.EmergencyTriageProtocol{}
	created, err := s.repo.CreateEmergencyTriageProtocol(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EmergencyTriageProtocolResponse{ID: created.ID}, nil
}

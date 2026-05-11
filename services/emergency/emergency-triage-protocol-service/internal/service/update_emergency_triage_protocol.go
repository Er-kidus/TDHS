package service

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
	"github.com/tenadam/emergency-triage-protocol-service/internal/validator"
)

// UpdateEmergencyTriageProtocol validates and updates an existing emergency-triage-protocol.
func (s *Service) UpdateEmergencyTriageProtocol(ctx context.Context, req dto.UpdateEmergencyTriageProtocolRequest) (*dto.EmergencyTriageProtocolResponse, error) {
	if err := validator.ValidateEmergencyTriageProtocolUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.EmergencyTriageProtocol{ID: req.ID}
	updated, err := s.repo.UpdateEmergencyTriageProtocol(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.EmergencyTriageProtocolResponse{ID: updated.ID}, nil
}

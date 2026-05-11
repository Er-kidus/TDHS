package service

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
)

// GetEmergencyTriageProtocol retrieves a single emergency-triage-protocol by ID.
func (s *Service) GetEmergencyTriageProtocol(ctx context.Context, id string) (*dto.EmergencyTriageProtocolResponse, error) {
	entity, err := s.repo.GetEmergencyTriageProtocol(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.EmergencyTriageProtocolResponse{ID: entity.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/dto"
)

// ListEmergencyTriageProtocols retrieves all emergency-triage-protocols.
func (s *Service) ListEmergencyTriageProtocols(ctx context.Context) (*dto.ListEmergencyTriageProtocolResponse, error) {
	entities, err := s.repo.ListEmergencyTriageProtocols(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.EmergencyTriageProtocolResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.EmergencyTriageProtocolResponse{ID: e.ID})
	}
	return &dto.ListEmergencyTriageProtocolResponse{Items: items, Total: len(items)}, nil
}

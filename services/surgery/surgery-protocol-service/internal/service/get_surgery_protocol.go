package service

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/dto"
)

// GetSurgeryProtocol retrieves a single surgery-protocol by ID.
func (s *Service) GetSurgeryProtocol(ctx context.Context, id string) (*dto.SurgeryProtocolResponse, error) {
	entity, err := s.repo.GetSurgeryProtocol(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.SurgeryProtocolResponse{ID: entity.ID}, nil
}

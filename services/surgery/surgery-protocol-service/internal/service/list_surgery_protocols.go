package service

import (
	"context"
	"github.com/tenadam/surgery-protocol-service/internal/dto"
)

// ListSurgeryProtocols retrieves all surgery-protocols.
func (s *Service) ListSurgeryProtocols(ctx context.Context) (*dto.ListSurgeryProtocolResponse, error) {
	entities, err := s.repo.ListSurgeryProtocols(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.SurgeryProtocolResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.SurgeryProtocolResponse{ID: e.ID})
	}
	return &dto.ListSurgeryProtocolResponse{Items: items, Total: len(items)}, nil
}

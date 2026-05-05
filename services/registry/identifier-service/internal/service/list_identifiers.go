package service

import (
	"context"
	"github.com/tenadam/identifier-service/internal/dto"
)

// ListIdentifiers retrieves all identifiers.
func (s *Service) ListIdentifiers(ctx context.Context) (*dto.ListIdentifierResponse, error) {
	entities, err := s.repo.ListIdentifiers(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.IdentifierResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.IdentifierResponse{ID: e.ID})
	}
	return &dto.ListIdentifierResponse{Items: items, Total: len(items)}, nil
}

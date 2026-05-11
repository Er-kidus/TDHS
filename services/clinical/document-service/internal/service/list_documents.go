package service

import (
	"context"
	"github.com/tenadam/document-service/internal/dto"
)

// ListDocuments retrieves all documents.
func (s *Service) ListDocuments(ctx context.Context) (*dto.ListDocumentResponse, error) {
	entities, err := s.repo.ListDocuments(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.DocumentResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.DocumentResponse{ID: e.ID})
	}
	return &dto.ListDocumentResponse{Items: items, Total: len(items)}, nil
}

package service

import (
	"context"
	"github.com/tenadam/document-service/internal/dto"
	"github.com/tenadam/document-service/internal/model"
	"github.com/tenadam/document-service/internal/validator"
)

// UpdateDocument validates and updates an existing document.
func (s *Service) UpdateDocument(ctx context.Context, req dto.UpdateDocumentRequest) (*dto.DocumentResponse, error) {
	if err := validator.ValidateDocumentUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.Document{ID: req.ID}
	updated, err := s.repo.UpdateDocument(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DocumentResponse{ID: updated.ID}, nil
}

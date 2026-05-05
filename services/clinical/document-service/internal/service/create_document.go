package service

import (
	"context"
	"github.com/tenadam/document-service/internal/dto"
	"github.com/tenadam/document-service/internal/model"
	"github.com/tenadam/document-service/internal/validator"
)

// CreateDocument validates and creates a new document.
func (s *Service) CreateDocument(ctx context.Context, req dto.CreateDocumentRequest) (*dto.DocumentResponse, error) {
	if err := validator.ValidateDocumentCreate(req); err != nil {
		return nil, err
	}
	entity := &model.Document{}
	created, err := s.repo.CreateDocument(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.DocumentResponse{ID: created.ID}, nil
}

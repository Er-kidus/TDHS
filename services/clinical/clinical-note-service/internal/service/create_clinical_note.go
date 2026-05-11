package service

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/dto"
	"github.com/tenadam/clinical-note-service/internal/model"
	"github.com/tenadam/clinical-note-service/internal/validator"
)

// CreateClinicalNote validates and creates a new clinical-note.
func (s *Service) CreateClinicalNote(ctx context.Context, req dto.CreateClinicalNoteRequest) (*dto.ClinicalNoteResponse, error) {
	if err := validator.ValidateClinicalNoteCreate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalNote{}
	created, err := s.repo.CreateClinicalNote(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalNoteResponse{ID: created.ID}, nil
}

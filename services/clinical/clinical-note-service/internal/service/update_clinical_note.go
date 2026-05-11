package service

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/dto"
	"github.com/tenadam/clinical-note-service/internal/model"
	"github.com/tenadam/clinical-note-service/internal/validator"
)

// UpdateClinicalNote validates and updates an existing clinical-note.
func (s *Service) UpdateClinicalNote(ctx context.Context, req dto.UpdateClinicalNoteRequest) (*dto.ClinicalNoteResponse, error) {
	if err := validator.ValidateClinicalNoteUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.ClinicalNote{ID: req.ID}
	updated, err := s.repo.UpdateClinicalNote(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.ClinicalNoteResponse{ID: updated.ID}, nil
}

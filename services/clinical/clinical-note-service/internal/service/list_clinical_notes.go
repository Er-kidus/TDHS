package service

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/dto"
)

// ListClinicalNotes retrieves all clinical-notes.
func (s *Service) ListClinicalNotes(ctx context.Context) (*dto.ListClinicalNoteResponse, error) {
	entities, err := s.repo.ListClinicalNotes(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ClinicalNoteResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ClinicalNoteResponse{ID: e.ID})
	}
	return &dto.ListClinicalNoteResponse{Items: items, Total: len(items)}, nil
}

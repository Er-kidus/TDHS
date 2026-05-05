package service

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/dto"
)

// GetClinicalNote retrieves a single clinical-note by ID.
func (s *Service) GetClinicalNote(ctx context.Context, id string) (*dto.ClinicalNoteResponse, error) {
	entity, err := s.repo.GetClinicalNote(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.ClinicalNoteResponse{ID: entity.ID}, nil
}

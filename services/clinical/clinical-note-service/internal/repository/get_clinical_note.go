package repository

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/model"
)

// GetClinicalNote retrieves a single clinical-note record by ID.
func (r *Repository) GetClinicalNote(ctx context.Context, id string) (*model.ClinicalNote, error) {
	return nil, nil
}

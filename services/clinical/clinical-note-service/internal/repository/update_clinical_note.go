package repository

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/model"
)

// UpdateClinicalNote updates an existing clinical-note record in the database.
func (r *Repository) UpdateClinicalNote(ctx context.Context, entity *model.ClinicalNote) (*model.ClinicalNote, error) {
	return entity, nil
}

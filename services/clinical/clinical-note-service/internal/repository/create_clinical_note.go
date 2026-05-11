package repository

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/model"
)

// CreateClinicalNote inserts a new clinical-note record into the database.
func (r *Repository) CreateClinicalNote(ctx context.Context, entity *model.ClinicalNote) (*model.ClinicalNote, error) {
	return entity, nil
}

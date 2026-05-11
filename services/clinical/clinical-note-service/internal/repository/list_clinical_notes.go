package repository

import (
	"context"
	"github.com/tenadam/clinical-note-service/internal/model"
)

// ListClinicalNotes retrieves all clinical-note records.
func (r *Repository) ListClinicalNotes(ctx context.Context) ([]*model.ClinicalNote, error) {
	return nil, nil
}

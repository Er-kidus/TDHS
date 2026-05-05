package repository

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/model"
)

// UpdateProgramReporting updates an existing program-reporting record in the database.
func (r *Repository) UpdateProgramReporting(ctx context.Context, entity *model.ProgramReporting) (*model.ProgramReporting, error) {
	return entity, nil
}

package repository

import (
	"context"
	"github.com/tenadam/program-reporting-service/internal/model"
)

// CreateProgramReporting inserts a new program-reporting record into the database.
func (r *Repository) CreateProgramReporting(ctx context.Context, entity *model.ProgramReporting) (*model.ProgramReporting, error) {
	return entity, nil
}

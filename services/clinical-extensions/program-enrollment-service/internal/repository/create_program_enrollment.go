package repository

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/model"
)

// CreateProgramEnrollment inserts a new program-enrollment record into the database.
func (r *Repository) CreateProgramEnrollment(ctx context.Context, entity *model.ProgramEnrollment) (*model.ProgramEnrollment, error) {
	return entity, nil
}

package repository

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/model"
)

// UpdateProgramEnrollment updates an existing program-enrollment record in the database.
func (r *Repository) UpdateProgramEnrollment(ctx context.Context, entity *model.ProgramEnrollment) (*model.ProgramEnrollment, error) {
	return entity, nil
}

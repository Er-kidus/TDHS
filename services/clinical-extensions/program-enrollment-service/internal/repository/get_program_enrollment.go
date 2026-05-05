package repository

import (
	"context"
	"github.com/tenadam/program-enrollment-service/internal/model"
)

// GetProgramEnrollment retrieves a single program-enrollment record by ID.
func (r *Repository) GetProgramEnrollment(ctx context.Context, id string) (*model.ProgramEnrollment, error) {
	return nil, nil
}

package repository

import (
	"context"
	"github.com/tenadam/insurance-eligibility-service/internal/model"
)

// CreateInsuranceEligibility inserts a new insurance-eligibility record into the database.
func (r *Repository) CreateInsuranceEligibility(ctx context.Context, entity *model.InsuranceEligibility) (*model.InsuranceEligibility, error) {
	return entity, nil
}

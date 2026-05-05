package repository

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/model"
)

// CreateDrugFormulary inserts a new drug-formulary record into the database.
func (r *Repository) CreateDrugFormulary(ctx context.Context, entity *model.DrugFormulary) (*model.DrugFormulary, error) {
	return entity, nil
}

package repository

import (
	"context"
	"github.com/tenadam/drug-formulary-service/internal/model"
)

// UpdateDrugFormulary updates an existing drug-formulary record in the database.
func (r *Repository) UpdateDrugFormulary(ctx context.Context, entity *model.DrugFormulary) (*model.DrugFormulary, error) {
	return entity, nil
}

package repository

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/model"
)

// ListClinicalDatas retrieves all clinical-data records.
func (r *Repository) ListClinicalDatas(ctx context.Context) ([]*model.ClinicalData, error) {
	return nil, nil
}

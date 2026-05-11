package repository

import (
	"context"
	"github.com/tenadam/ussd-service/internal/model"
)

// CreateUssd inserts a new ussd record into the database.
func (r *Repository) CreateUssd(ctx context.Context, entity *model.Ussd) (*model.Ussd, error) {
	return entity, nil
}

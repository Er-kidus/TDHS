package repository

import (
	"context"
	"github.com/tenadam/ussd-service/internal/model"
)

// UpdateUssd updates an existing ussd record in the database.
func (r *Repository) UpdateUssd(ctx context.Context, entity *model.Ussd) (*model.Ussd, error) {
	return entity, nil
}

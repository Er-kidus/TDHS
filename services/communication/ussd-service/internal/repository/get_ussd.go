package repository

import (
	"context"
	"github.com/tenadam/ussd-service/internal/model"
)

// GetUssd retrieves a single ussd record by ID.
func (r *Repository) GetUssd(ctx context.Context, id string) (*model.Ussd, error) {
	return nil, nil
}

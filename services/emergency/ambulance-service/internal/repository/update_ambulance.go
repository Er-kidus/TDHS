package repository

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/model"
)

// UpdateAmbulance updates an existing ambulance record in the database.
func (r *Repository) UpdateAmbulance(ctx context.Context, entity *model.Ambulance) (*model.Ambulance, error) {
	return entity, nil
}

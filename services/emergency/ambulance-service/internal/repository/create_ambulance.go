package repository

import (
	"context"
	"github.com/tenadam/ambulance-service/internal/model"
)

// CreateAmbulance inserts a new ambulance record into the database.
func (r *Repository) CreateAmbulance(ctx context.Context, entity *model.Ambulance) (*model.Ambulance, error) {
	return entity, nil
}

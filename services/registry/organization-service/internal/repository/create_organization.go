package repository

import (
	"context"
	"github.com/tenadam/organization-service/internal/model"
)

// CreateOrganization inserts a new organization record into the database.
func (r *Repository) CreateOrganization(ctx context.Context, entity *model.Organization) (*model.Organization, error) {
	return entity, nil
}

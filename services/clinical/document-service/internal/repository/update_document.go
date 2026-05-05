package repository

import (
	"context"
	"github.com/tenadam/document-service/internal/model"
)

// UpdateDocument updates an existing document record in the database.
func (r *Repository) UpdateDocument(ctx context.Context, entity *model.Document) (*model.Document, error) {
	return entity, nil
}

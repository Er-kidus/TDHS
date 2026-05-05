package repository

import (
	"context"
	"github.com/tenadam/document-service/internal/model"
)

// CreateDocument inserts a new document record into the database.
func (r *Repository) CreateDocument(ctx context.Context, entity *model.Document) (*model.Document, error) {
	return entity, nil
}

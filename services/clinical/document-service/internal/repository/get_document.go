package repository

import (
	"context"
	"github.com/tenadam/document-service/internal/model"
)

// GetDocument retrieves a single document record by ID.
func (r *Repository) GetDocument(ctx context.Context, id string) (*model.Document, error) {
	return nil, nil
}

package repository

import (
	"context"
	"github.com/tenadam/chat-service/internal/model"
)

// GetChat retrieves a single chat record by ID.
func (r *Repository) GetChat(ctx context.Context, id string) (*model.Chat, error) {
	return nil, nil
}

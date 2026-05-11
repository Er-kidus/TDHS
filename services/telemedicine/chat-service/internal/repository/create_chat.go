package repository

import (
	"context"
	"github.com/tenadam/chat-service/internal/model"
)

// CreateChat inserts a new chat record into the database.
func (r *Repository) CreateChat(ctx context.Context, entity *model.Chat) (*model.Chat, error) {
	return entity, nil
}

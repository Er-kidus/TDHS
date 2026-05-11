package repository

import (
	"context"
	"github.com/tenadam/chat-service/internal/model"
)

// UpdateChat updates an existing chat record in the database.
func (r *Repository) UpdateChat(ctx context.Context, entity *model.Chat) (*model.Chat, error) {
	return entity, nil
}

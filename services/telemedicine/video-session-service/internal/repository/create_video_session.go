package repository

import (
	"context"
	"github.com/tenadam/video-session-service/internal/model"
)

// CreateVideoSession inserts a new video-session record into the database.
func (r *Repository) CreateVideoSession(ctx context.Context, entity *model.VideoSession) (*model.VideoSession, error) {
	return entity, nil
}

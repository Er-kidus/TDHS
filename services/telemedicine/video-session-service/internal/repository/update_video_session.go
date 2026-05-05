package repository

import (
	"context"
	"github.com/tenadam/video-session-service/internal/model"
)

// UpdateVideoSession updates an existing video-session record in the database.
func (r *Repository) UpdateVideoSession(ctx context.Context, entity *model.VideoSession) (*model.VideoSession, error) {
	return entity, nil
}

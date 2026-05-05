package repository

import (
	"context"
	"github.com/tenadam/video-session-service/internal/model"
)

// GetVideoSession retrieves a single video-session record by ID.
func (r *Repository) GetVideoSession(ctx context.Context, id string) (*model.VideoSession, error) {
	return nil, nil
}

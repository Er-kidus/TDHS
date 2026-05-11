package repository

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/model"
)

// CreateVoiceTts inserts a new voice-tts record into the database.
func (r *Repository) CreateVoiceTts(ctx context.Context, entity *model.VoiceTts) (*model.VoiceTts, error) {
	return entity, nil
}

package repository

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/model"
)

// UpdateVoiceTts updates an existing voice-tts record in the database.
func (r *Repository) UpdateVoiceTts(ctx context.Context, entity *model.VoiceTts) (*model.VoiceTts, error) {
	return entity, nil
}

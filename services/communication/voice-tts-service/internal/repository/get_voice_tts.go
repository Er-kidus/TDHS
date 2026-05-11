package repository

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/model"
)

// GetVoiceTts retrieves a single voice-tts record by ID.
func (r *Repository) GetVoiceTts(ctx context.Context, id string) (*model.VoiceTts, error) {
	return nil, nil
}

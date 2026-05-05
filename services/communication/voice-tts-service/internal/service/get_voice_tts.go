package service

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/dto"
)

// GetVoiceTts retrieves a single voice-tts by ID.
func (s *Service) GetVoiceTts(ctx context.Context, id string) (*dto.VoiceTtsResponse, error) {
	entity, err := s.repo.GetVoiceTts(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.VoiceTtsResponse{ID: entity.ID}, nil
}

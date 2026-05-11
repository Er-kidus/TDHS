package service

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/dto"
	"github.com/tenadam/voice-tts-service/internal/model"
	"github.com/tenadam/voice-tts-service/internal/validator"
)

// CreateVoiceTts validates and creates a new voice-tts.
func (s *Service) CreateVoiceTts(ctx context.Context, req dto.CreateVoiceTtsRequest) (*dto.VoiceTtsResponse, error) {
	if err := validator.ValidateVoiceTtsCreate(req); err != nil {
		return nil, err
	}
	entity := &model.VoiceTts{}
	created, err := s.repo.CreateVoiceTts(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VoiceTtsResponse{ID: created.ID}, nil
}

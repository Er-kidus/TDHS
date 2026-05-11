package service

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/dto"
	"github.com/tenadam/voice-tts-service/internal/model"
	"github.com/tenadam/voice-tts-service/internal/validator"
)

// UpdateVoiceTts validates and updates an existing voice-tts.
func (s *Service) UpdateVoiceTts(ctx context.Context, req dto.UpdateVoiceTtsRequest) (*dto.VoiceTtsResponse, error) {
	if err := validator.ValidateVoiceTtsUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.VoiceTts{ID: req.ID}
	updated, err := s.repo.UpdateVoiceTts(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.VoiceTtsResponse{ID: updated.ID}, nil
}

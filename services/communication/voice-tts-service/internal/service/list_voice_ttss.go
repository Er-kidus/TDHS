package service

import (
	"context"
	"github.com/tenadam/voice-tts-service/internal/dto"
)

// ListVoiceTtss retrieves all voice-ttss.
func (s *Service) ListVoiceTtss(ctx context.Context) (*dto.ListVoiceTtsResponse, error) {
	entities, err := s.repo.ListVoiceTtss(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.VoiceTtsResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.VoiceTtsResponse{ID: e.ID})
	}
	return &dto.ListVoiceTtsResponse{Items: items, Total: len(items)}, nil
}

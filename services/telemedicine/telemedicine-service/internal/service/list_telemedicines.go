package service

import (
	"context"
	"github.com/tenadam/telemedicine-service/internal/dto"
)

// ListTelemedicines retrieves all telemedicines.
func (s *Service) ListTelemedicines(ctx context.Context) (*dto.ListTelemedicineResponse, error) {
	entities, err := s.repo.ListTelemedicines(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.TelemedicineResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.TelemedicineResponse{ID: e.ID})
	}
	return &dto.ListTelemedicineResponse{Items: items, Total: len(items)}, nil
}

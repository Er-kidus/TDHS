package service

import (
	"context"
	"github.com/tenadam/imaging-service/internal/dto"
)

// ListImagings retrieves all imagings.
func (s *Service) ListImagings(ctx context.Context) (*dto.ListImagingResponse, error) {
	entities, err := s.repo.ListImagings(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ImagingResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ImagingResponse{ID: e.ID})
	}
	return &dto.ListImagingResponse{Items: items, Total: len(items)}, nil
}

package service

import (
	"context"
	"github.com/tenadam/inpatient-service/internal/dto"
)

// GetInpatient retrieves a single inpatient by ID.
func (s *Service) GetInpatient(ctx context.Context, id string) (*dto.InpatientResponse, error) {
	entity, err := s.repo.GetInpatient(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.InpatientResponse{ID: entity.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/clinical-data-service/internal/dto"
)

// ListClinicalDatas retrieves all clinical-datas.
func (s *Service) ListClinicalDatas(ctx context.Context) (*dto.ListClinicalDataResponse, error) {
	entities, err := s.repo.ListClinicalDatas(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.ClinicalDataResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.ClinicalDataResponse{ID: e.ID})
	}
	return &dto.ListClinicalDataResponse{Items: items, Total: len(items)}, nil
}

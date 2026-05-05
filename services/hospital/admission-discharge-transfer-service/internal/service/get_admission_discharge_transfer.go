package service

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
)

// GetAdmissionDischargeTransfer retrieves a single admission-discharge-transfer by ID.
func (s *Service) GetAdmissionDischargeTransfer(ctx context.Context, id string) (*dto.AdmissionDischargeTransferResponse, error) {
	entity, err := s.repo.GetAdmissionDischargeTransfer(ctx, id)
	if err != nil {
		return nil, err
	}
	if entity == nil {
		return nil, nil
	}
	return &dto.AdmissionDischargeTransferResponse{ID: entity.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
)

// ListAdmissionDischargeTransfers retrieves all admission-discharge-transfers.
func (s *Service) ListAdmissionDischargeTransfers(ctx context.Context) (*dto.ListAdmissionDischargeTransferResponse, error) {
	entities, err := s.repo.ListAdmissionDischargeTransfers(ctx)
	if err != nil {
		return nil, err
	}
	items := make([]dto.AdmissionDischargeTransferResponse, 0, len(entities))
	for _, e := range entities {
		items = append(items, dto.AdmissionDischargeTransferResponse{ID: e.ID})
	}
	return &dto.ListAdmissionDischargeTransferResponse{Items: items, Total: len(items)}, nil
}

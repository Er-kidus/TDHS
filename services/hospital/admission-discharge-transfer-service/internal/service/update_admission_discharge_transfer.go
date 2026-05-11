package service

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
	"github.com/tenadam/admission-discharge-transfer-service/internal/model"
	"github.com/tenadam/admission-discharge-transfer-service/internal/validator"
)

// UpdateAdmissionDischargeTransfer validates and updates an existing admission-discharge-transfer.
func (s *Service) UpdateAdmissionDischargeTransfer(ctx context.Context, req dto.UpdateAdmissionDischargeTransferRequest) (*dto.AdmissionDischargeTransferResponse, error) {
	if err := validator.ValidateAdmissionDischargeTransferUpdate(req); err != nil {
		return nil, err
	}
	entity := &model.AdmissionDischargeTransfer{ID: req.ID}
	updated, err := s.repo.UpdateAdmissionDischargeTransfer(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AdmissionDischargeTransferResponse{ID: updated.ID}, nil
}

package service

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/dto"
	"github.com/tenadam/admission-discharge-transfer-service/internal/model"
	"github.com/tenadam/admission-discharge-transfer-service/internal/validator"
)

// CreateAdmissionDischargeTransfer validates and creates a new admission-discharge-transfer.
func (s *Service) CreateAdmissionDischargeTransfer(ctx context.Context, req dto.CreateAdmissionDischargeTransferRequest) (*dto.AdmissionDischargeTransferResponse, error) {
	if err := validator.ValidateAdmissionDischargeTransferCreate(req); err != nil {
		return nil, err
	}
	entity := &model.AdmissionDischargeTransfer{}
	created, err := s.repo.CreateAdmissionDischargeTransfer(ctx, entity)
	if err != nil {
		return nil, err
	}
	return &dto.AdmissionDischargeTransferResponse{ID: created.ID}, nil
}

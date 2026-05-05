package repository

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/model"
)

// UpdateAdmissionDischargeTransfer updates an existing admission-discharge-transfer record in the database.
func (r *Repository) UpdateAdmissionDischargeTransfer(ctx context.Context, entity *model.AdmissionDischargeTransfer) (*model.AdmissionDischargeTransfer, error) {
	return entity, nil
}

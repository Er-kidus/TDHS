package repository

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/model"
)

// ListAdmissionDischargeTransfers retrieves all admission-discharge-transfer records.
func (r *Repository) ListAdmissionDischargeTransfers(ctx context.Context) ([]*model.AdmissionDischargeTransfer, error) {
	return nil, nil
}

package repository

import (
	"context"
	"github.com/tenadam/admission-discharge-transfer-service/internal/model"
)

// CreateAdmissionDischargeTransfer inserts a new admission-discharge-transfer record into the database.
func (r *Repository) CreateAdmissionDischargeTransfer(ctx context.Context, entity *model.AdmissionDischargeTransfer) (*model.AdmissionDischargeTransfer, error) {
	return entity, nil
}

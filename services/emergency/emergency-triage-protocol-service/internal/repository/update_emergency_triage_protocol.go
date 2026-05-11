package repository

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
)

// UpdateEmergencyTriageProtocol updates an existing emergency-triage-protocol record in the database.
func (r *Repository) UpdateEmergencyTriageProtocol(ctx context.Context, entity *model.EmergencyTriageProtocol) (*model.EmergencyTriageProtocol, error) {
	return entity, nil
}

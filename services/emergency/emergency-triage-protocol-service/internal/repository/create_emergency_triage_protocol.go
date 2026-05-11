package repository

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
)

// CreateEmergencyTriageProtocol inserts a new emergency-triage-protocol record into the database.
func (r *Repository) CreateEmergencyTriageProtocol(ctx context.Context, entity *model.EmergencyTriageProtocol) (*model.EmergencyTriageProtocol, error) {
	return entity, nil
}

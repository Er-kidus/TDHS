package repository

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
)

// GetEmergencyTriageProtocol retrieves a single emergency-triage-protocol record by ID.
func (r *Repository) GetEmergencyTriageProtocol(ctx context.Context, id string) (*model.EmergencyTriageProtocol, error) {
	return nil, nil
}

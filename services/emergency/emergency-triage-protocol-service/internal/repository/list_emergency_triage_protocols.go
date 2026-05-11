package repository

import (
	"context"
	"github.com/tenadam/emergency-triage-protocol-service/internal/model"
)

// ListEmergencyTriageProtocols retrieves all emergency-triage-protocol records.
func (r *Repository) ListEmergencyTriageProtocols(ctx context.Context) ([]*model.EmergencyTriageProtocol, error) {
	return nil, nil
}

package model

import "time"

// AuditAnalytics represents a audit-analytics entity.
type AuditAnalytics struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

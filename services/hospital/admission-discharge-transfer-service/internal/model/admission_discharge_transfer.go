package model

import "time"

// AdmissionDischargeTransfer represents a admission-discharge-transfer entity.
type AdmissionDischargeTransfer struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

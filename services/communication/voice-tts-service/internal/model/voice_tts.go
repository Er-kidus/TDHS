package model

import "time"

// VoiceTts represents a voice-tts entity.
type VoiceTts struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

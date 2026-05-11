package dto

// CreateVoiceTtsRequest holds the fields required to create a voice-tts.
type CreateVoiceTtsRequest struct {
}

// UpdateVoiceTtsRequest holds the fields that can be updated on a voice-tts.
type UpdateVoiceTtsRequest struct {
	ID string `json:"id"`
}

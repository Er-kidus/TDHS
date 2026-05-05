package dto

// VoiceTtsResponse is the standard response payload for a single voice-tts.
type VoiceTtsResponse struct {
	ID string `json:"id"`
}

// ListVoiceTtsResponse is the response payload for a list of voice-ttss.
type ListVoiceTtsResponse struct {
	Items []VoiceTtsResponse `json:"items"`
	Total int                       `json:"total"`
}

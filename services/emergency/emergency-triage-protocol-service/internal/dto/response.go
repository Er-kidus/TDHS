package dto

// EmergencyTriageProtocolResponse is the standard response payload for a single emergency-triage-protocol.
type EmergencyTriageProtocolResponse struct {
	ID string `json:"id"`
}

// ListEmergencyTriageProtocolResponse is the response payload for a list of emergency-triage-protocols.
type ListEmergencyTriageProtocolResponse struct {
	Items []EmergencyTriageProtocolResponse `json:"items"`
	Total int                       `json:"total"`
}

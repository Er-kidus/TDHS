package dto

// CreateOutbreakDetectionRequest holds the fields required to create a outbreak-detection.
type CreateOutbreakDetectionRequest struct {
}

// UpdateOutbreakDetectionRequest holds the fields that can be updated on a outbreak-detection.
type UpdateOutbreakDetectionRequest struct {
	ID string `json:"id"`
}

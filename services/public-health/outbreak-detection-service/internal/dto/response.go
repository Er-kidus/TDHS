package dto

// OutbreakDetectionResponse is the standard response payload for a single outbreak-detection.
type OutbreakDetectionResponse struct {
	ID string `json:"id"`
}

// ListOutbreakDetectionResponse is the response payload for a list of outbreak-detections.
type ListOutbreakDetectionResponse struct {
	Items []OutbreakDetectionResponse `json:"items"`
	Total int                       `json:"total"`
}

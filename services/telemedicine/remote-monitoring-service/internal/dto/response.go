package dto

// RemoteMonitoringResponse is the standard response payload for a single remote-monitoring.
type RemoteMonitoringResponse struct {
	ID string `json:"id"`
}

// ListRemoteMonitoringResponse is the response payload for a list of remote-monitorings.
type ListRemoteMonitoringResponse struct {
	Items []RemoteMonitoringResponse `json:"items"`
	Total int                       `json:"total"`
}

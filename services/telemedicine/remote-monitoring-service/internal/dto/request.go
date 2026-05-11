package dto

// CreateRemoteMonitoringRequest holds the fields required to create a remote-monitoring.
type CreateRemoteMonitoringRequest struct {
}

// UpdateRemoteMonitoringRequest holds the fields that can be updated on a remote-monitoring.
type UpdateRemoteMonitoringRequest struct {
	ID string `json:"id"`
}

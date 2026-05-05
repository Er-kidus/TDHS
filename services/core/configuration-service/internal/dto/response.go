package dto

// ConfigurationResponse is the standard response payload for a single configuration.
type ConfigurationResponse struct {
	ID string `json:"id"`
}

// ListConfigurationResponse is the response payload for a list of configurations.
type ListConfigurationResponse struct {
	Items []ConfigurationResponse `json:"items"`
	Total int                       `json:"total"`
}

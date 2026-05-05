package dto

// CreateConfigurationRequest holds the fields required to create a configuration.
type CreateConfigurationRequest struct {
}

// UpdateConfigurationRequest holds the fields that can be updated on a configuration.
type UpdateConfigurationRequest struct {
	ID string `json:"id"`
}

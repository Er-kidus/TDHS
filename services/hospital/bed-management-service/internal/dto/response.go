package dto

// BedManagementResponse is the standard response payload for a single bed-management.
type BedManagementResponse struct {
	ID string `json:"id"`
}

// ListBedManagementResponse is the response payload for a list of bed-managements.
type ListBedManagementResponse struct {
	Items []BedManagementResponse `json:"items"`
	Total int                       `json:"total"`
}

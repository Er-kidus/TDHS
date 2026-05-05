package dto

// CreateAssetRequest holds the fields required to create a asset.
type CreateAssetRequest struct {
}

// UpdateAssetRequest holds the fields that can be updated on a asset.
type UpdateAssetRequest struct {
	ID string `json:"id"`
}

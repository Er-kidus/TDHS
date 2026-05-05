package dto

// AssetResponse is the standard response payload for a single asset.
type AssetResponse struct {
	ID string `json:"id"`
}

// ListAssetResponse is the response payload for a list of assets.
type ListAssetResponse struct {
	Items []AssetResponse `json:"items"`
	Total int                       `json:"total"`
}

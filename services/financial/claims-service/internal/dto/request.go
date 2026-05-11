package dto

// CreateClaimsRequest holds the fields required to create a claims.
type CreateClaimsRequest struct {
}

// UpdateClaimsRequest holds the fields that can be updated on a claims.
type UpdateClaimsRequest struct {
	ID string `json:"id"`
}

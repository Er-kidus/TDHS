package dto

// CreateConsentRequest holds the fields required to create a consent.
type CreateConsentRequest struct {
}

// UpdateConsentRequest holds the fields that can be updated on a consent.
type UpdateConsentRequest struct {
	ID string `json:"id"`
}

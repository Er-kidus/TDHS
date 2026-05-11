package dto

// CreateClinicalGuidelineRequest holds the fields required to create a clinical-guideline.
type CreateClinicalGuidelineRequest struct {
}

// UpdateClinicalGuidelineRequest holds the fields that can be updated on a clinical-guideline.
type UpdateClinicalGuidelineRequest struct {
	ID string `json:"id"`
}

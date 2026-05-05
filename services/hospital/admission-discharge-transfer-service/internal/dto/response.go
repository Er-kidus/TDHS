package dto

// AdmissionDischargeTransferResponse is the standard response payload for a single admission-discharge-transfer.
type AdmissionDischargeTransferResponse struct {
	ID string `json:"id"`
}

// ListAdmissionDischargeTransferResponse is the response payload for a list of admission-discharge-transfers.
type ListAdmissionDischargeTransferResponse struct {
	Items []AdmissionDischargeTransferResponse `json:"items"`
	Total int                       `json:"total"`
}

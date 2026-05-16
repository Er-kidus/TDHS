package handler

import (
	"encoding/json"
	"net/http"
)

// ── Global Medications Catalog ────────────────────────────────────────────────

func (h *Handler) ListMedications(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	limit := parseLimit(r, 100)

	meds, err := h.svcs.Pharmacy.ListMedications(r.Context(), q, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list medications")
		return
	}
	h.writeJSON(w, http.StatusOK, meds)
}

// ── Org Pharmacy Inventory ────────────────────────────────────────────────────

func (h *Handler) OrgUpdateInventory(w http.ResponseWriter, r *http.Request) {
	var req struct {
		MedicationID string  `json:"medication_id"`
		StockLevel   int     `json:"stock_level"`
		ReorderLevel int     `json:"reorder_level"`
		UnitPrice    float64 `json:"unit_price"`
		Status       string  `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if req.MedicationID == "" {
		h.errorJSON(w, http.StatusBadRequest, "medication_id is required")
		return
	}
	if req.Status == "" {
		req.Status = "in_stock"
	}

	orgID := subjectOrgID(r.Context())
	inv, err := h.svcs.Pharmacy.OrgUpdateInventory(r.Context(), orgID, req.MedicationID, req.StockLevel, req.ReorderLevel, req.UnitPrice, req.Status)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to update inventory")
		return
	}
	h.writeJSON(w, http.StatusOK, inv)
}

func (h *Handler) OrgListInventory(w http.ResponseWriter, r *http.Request) {
	orgID := subjectOrgID(r.Context())
	limit := parseLimit(r, 100)

	inv, err := h.svcs.Pharmacy.OrgListInventory(r.Context(), orgID, limit)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to list inventory")
		return
	}
	h.writeJSON(w, http.StatusOK, inv)
}

// ── Patient Pharmacy Search ───────────────────────────────────────────────────

func (h *Handler) PatientSearchPharmacies(w http.ResponseWriter, r *http.Request) {
	medID := r.URL.Query().Get("medication_id")
	if medID == "" {
		h.errorJSON(w, http.StatusBadRequest, "medication_id is required")
		return
	}
	
	// Optional lat/lng for distance sorting if implemented
	// lat := parseFloat(r.URL.Query().Get("lat"), 0)
	// lng := parseFloat(r.URL.Query().Get("lng"), 0)

	results, err := h.svcs.Pharmacy.PatientSearchPharmacies(r.Context(), medID, 0, 0)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to search pharmacies")
		return
	}
	h.writeJSON(w, http.StatusOK, results)
}

// ── Org Prescription Fulfillment ──────────────────────────────────────────────

func (h *Handler) OrgLogFulfillment(w http.ResponseWriter, r *http.Request) {
	var req struct {
		PrescriptionID    string `json:"prescription_id"`
		PatientID         string `json:"patient_id"`
		MedicationID      string `json:"medication_id"`
		QuantityDispensed int    `json:"quantity_dispensed"`
		Notes             string `json:"notes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.errorJSON(w, http.StatusBadRequest, "invalid request body")
		return
	}

	orgID := subjectOrgID(r.Context())
	pharmacistID := subjectID(r.Context())

	ful, err := h.svcs.Pharmacy.OrgLogFulfillment(r.Context(), orgID, pharmacistID, req.PrescriptionID, req.PatientID, req.MedicationID, req.QuantityDispensed, req.Notes)
	if err != nil {
		h.errorJSON(w, http.StatusInternalServerError, "failed to log fulfillment")
		return
	}
	h.writeJSON(w, http.StatusCreated, ful)
}

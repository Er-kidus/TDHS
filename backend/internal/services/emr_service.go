package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"pharmacy-backend/internal/models"
)

type EMRService struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

type FHIRPatient struct {
	ResourceType string `json:"resourceType"`
	ID           string `json:"id"`
	Name         []struct {
		Use  string `json:"use"`
		Family string `json:"family"`
		Given []string `json:"given"`
	} `json:"name"`
	BirthDate string `json:"birthDate"`
	Gender     string `json:"gender"`
	Identifier []struct {
		Type struct {
			Coding []struct {
				System string `json:"system"`
				Code   string `json:"code"`
			} `json:"coding"`
		} `json:"type"`
		Value string `json:"value"`
	} `json:"identifier"`
}

type FHIRMedicationRequest struct {
	ResourceType string `json:"resourceType"`
	ID           string `json:"id"`
	Status       string `json:"status"`
	Intent       string `json:"intent"`
	Medication   struct {
		CodeableConcept struct {
			Coding []struct {
				System string `json:"system"`
				Code   string `json:"code"`
				Display string `json:"display"`
			} `json:"coding"`
		} `json:"codeableConcept"`
	} `json:"medication"`
	Subject struct {
		Reference string `json:"reference"`
	} `json:"subject"`
	AuthoredOn string `json:"authoredOn"`
	Requester  struct {
		Reference string `json:"reference"`
	} `json:"requester"`
	DosageInstruction []struct {
		Text             string `json:"text"`
		Route            *struct {
			Coding []struct {
				System string `json:"system"`
				Code   string `json:"code"`
			} `json:"coding"`
		} `json:"route"`
		DoseAndRate []struct {
			Dose struct {
				Quantity struct {
					Value  float64 `json:"value"`
					Unit   string `json:"unit"`
					System string `json:"system"`
					Code   string `json:"code"`
				} `json:"quantity"`
			} `json:"dose"`
		} `json:"doseAndRate"`
	} `json:"dosageInstruction"`
	DispenseRequest struct {
		Quantity struct {
			Value  float64 `json:"value"`
			Unit   string `json:"unit"`
			System string `json:"system"`
			Code   string `json:"code"`
		} `json:"quantity"`
		ExpectedSupplyDuration struct {
			Value  float64 `json:"value"`
			Unit   string `json:"unit"`
			System string `json:"system"`
			Code   string `json:"code"`
		} `json:"expectedSupplyDuration"`
		NumberOfRepeatsAllowed int `json:"numberOfRepeatsAllowed"`
	} `json:"dispenseRequest"`
}

type FHIRObservation struct {
	ResourceType string `json:"resourceType"`
	ID           string `json:"id"`
	Status       string `json:"status"`
	Category     []struct {
		Coding []struct {
			System string `json:"system"`
			Code   string `json:"code"`
			Display string `json:"display"`
		} `json:"coding"`
	} `json:"category"`
	Code struct {
		Coding []struct {
			System string `json:"system"`
			Code   string `json:"code"`
			Display string `json:"display"`
		} `json:"coding"`
	} `json:"code"`
	Subject struct {
		Reference string `json:"reference"`
	} `json:"subject"`
	EffectiveDateTime string `json:"effectiveDateTime"`
	ValueQuantity     *struct {
		Value  float64 `json:"value"`
		Unit   string `json:"unit"`
		System string `json:"system"`
		Code   string `json:"code"`
	} `json:"valueQuantity"`
	Component []struct {
		Code struct {
			Coding []struct {
				System string `json:"system"`
				Code   string `json:"code"`
				Display string `json:"display"`
			} `json:"coding"`
		} `json:"code"`
		ValueQuantity *struct {
			Value  float64 `json:"value"`
			Unit   string `json:"unit"`
			System string `json:"system"`
			Code   string `json:"code"`
		} `json:"valueQuantity"`
	} `json:"component"`
}

func NewEMRService(baseURL, apiKey string) *EMRService {
	return &EMRService{
		baseURL: baseURL,
		apiKey:  apiKey,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (s *EMRService) GetPatient(patientID string) (*FHIRPatient, error) {
	url := fmt.Sprintf("%s/Patient/%s", s.baseURL, patientID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var patient FHIRPatient
	if err := json.NewDecoder(resp.Body).Decode(&patient); err != nil {
		return nil, err
	}
	
	return &patient, nil
}

func (s *EMRService) SearchPatient(identifier string) ([]FHIRPatient, error) {
	url := fmt.Sprintf("%s/Patient?identifier=%s", s.baseURL, identifier)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var bundle struct {
		ResourceType string       `json:"resourceType"`
		Entry        []struct {
			Resource FHIRPatient `json:"resource"`
		} `json:"entry"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&bundle); err != nil {
		return nil, err
	}
	
	patients := make([]FHIRPatient, len(bundle.Entry))
	for i, entry := range bundle.Entry {
		patients[i] = entry.Resource
	}
	
	return patients, nil
}

func (s *EMRService) GetMedicationRequests(patientID string) ([]FHIRMedicationRequest, error) {
	url := fmt.Sprintf("%s/MedicationRequest?patient=%s", s.baseURL, patientID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var bundle struct {
		ResourceType string       `json:"resourceType"`
		Entry        []struct {
			Resource FHIRMedicationRequest `json:"resource"`
		} `json:"entry"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&bundle); err != nil {
		return nil, err
	}
	
	requests := make([]FHIRMedicationRequest, len(bundle.Entry))
	for i, entry := range bundle.Entry {
		requests[i] = entry.Resource
	}
	
	return requests, nil
}

func (s *EMRService) GetObservations(patientID string) ([]FHIRObservation, error) {
	url := fmt.Sprintf("%s/Observation?patient=%s", s.baseURL, patientID)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	var bundle struct {
		ResourceType string       `json:"resourceType"`
		Entry        []struct {
			Resource FHIRObservation `json:"resource"`
		} `json:"entry"`
	}
	
	if err := json.NewDecoder(resp.Body).Decode(&bundle); err != nil {
		return nil, err
	}
	
	observations := make([]FHIRObservation, len(bundle.Entry))
	for i, entry := range bundle.Entry {
		observations[i] = entry.Resource
	}
	
	return observations, nil
}

func (s *EMRService) CreatePrescription(prescription *models.Prescription, items []models.PrescriptionItem) error {
	// Convert prescription to FHIR MedicationRequest
	fhirRequest := FHIRMedicationRequest{
		ResourceType: "MedicationRequest",
		Status:       "active",
		Intent:       "order",
		AuthoredOn:   prescription.DatePrescribed.Format(time.RFC3339),
	}
	
	// Set patient reference
	fhirRequest.Subject.Reference = fmt.Sprintf("Patient/%s", prescription.PatientID)
	
	// Set doctor reference
	fhirRequest.Requester.Reference = fmt.Sprintf("Practitioner/%s", prescription.DoctorID)
	
	// Process prescription items
	for _, item := range items {
		dosage := struct {
			Text string `json:"text"`
			DoseAndRate []struct {
				Dose struct {
					Quantity struct {
						Value  float64 `json:"value"`
						Unit   string `json:"unit"`
						System string `json:"system"`
						Code   string `json:"code"`
					} `json:"dose"`
				} `json:"dose"`
			} `json:"doseAndRate"`
		}{
			Text: item.Instructions,
		}
		
		if item.Quantity > 0 {
			dosage.DoseAndRate = append(dosage.DoseAndRate, struct {
				Dose struct {
					Quantity struct {
						Value  float64 `json:"value"`
						Unit   string `json:"unit"`
						System string `json:"system"`
						Code   string `json:"code"`
					} `json:"dose"`
				} `json:"dose"`
			}{
				Dose: struct {
					Quantity struct {
						Value  float64 `json:"value"`
						Unit   string `json:"unit"`
						System string `json:"system"`
						Code   string `json:"code"`
					} `json:"quantity"`
				}{
					Quantity: struct {
						Value  float64 `json:"value"`
						Unit   string `json:"unit"`
						System string `json:"system"`
						Code   string `json:"code"`
					}{
						Value:  float64(item.Quantity),
						Unit:   "tablet",
						System: "http://unitsofmeasure.org",
						Code:   "tbl",
					},
				},
			})
		}
		
		fhirRequest.DosageInstruction = append(fhirRequest.DosageInstruction, dosage)
	}
	
	// Set dispense request
	if len(items) > 0 {
		fhirRequest.DispenseRequest.Quantity = struct {
			Value  float64 `json:"value"`
			Unit   string `json:"unit"`
			System string `json:"system"`
			Code   string `json:"code"`
		}{
			Value:  float64(items[0].Quantity),
			Unit:   "tablet",
			System: "http://unitsofmeasure.org",
			Code:   "tbl",
		}
		
		fhirRequest.DispenseRequest.NumberOfRepeatsAllowed = items[0].RefillsRemaining
	}
	
	// Serialize to JSON
	jsonData, err := json.Marshal(fhirRequest)
	if err != nil {
		return err
	}
	
	// Send to EMR system
	url := fmt.Sprintf("%s/MedicationRequest", s.baseURL)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/fhir+json")
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	return nil
}

func (s *EMRService) UpdatePrescriptionStatus(prescriptionID string, status string) error {
	url := fmt.Sprintf("%s/MedicationRequest/%s", s.baseURL, prescriptionID)
	
	// Create patch operation
	patch := struct {
		ResourceType string `json:"resourceType"`
		ID           string `json:"id"`
		Status       string `json:"status"`
	}{
		ResourceType: "MedicationRequest",
		ID:           prescriptionID,
		Status:       status,
	}
	
	jsonData, err := json.Marshal(patch)
	if err != nil {
		return err
	}
	
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Content-Type", "application/fhir+json")
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	return nil
}

func (s *EMRService) TestConnection() error {
	url := fmt.Sprintf("%s/metadata", s.baseURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	
	req.Header.Set("Authorization", "Bearer "+s.apiKey)
	req.Header.Set("Accept", "application/fhir+json")
	
	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Connection test failed with status %d: %s", resp.StatusCode, string(body))
	}
	
	return nil
}

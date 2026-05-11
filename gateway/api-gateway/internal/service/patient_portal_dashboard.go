package service

import (
	"context"
)

type PatientDashboardService struct {
	Patients      *PatientService
	Appointments  *AppointmentService
	PatientPortal *PatientPortalService
}

type PatientDashboardResponse struct {
	Patient       any `json:"patient"`
	Appointments  any `json:"appointments"`
	Labs          any `json:"labs"`
	Messages      any `json:"messages"`
	Prescriptions any `json:"prescriptions"`
	Invoices      any `json:"invoices"`
}

func NewPatientDashboardService(
	patients *PatientService,
	appointments *AppointmentService,
	portal *PatientPortalService,
) *PatientDashboardService {
	return &PatientDashboardService{
		Patients:      patients,
		Appointments:  appointments,
		PatientPortal: portal,
	}
}

func (s *PatientDashboardService) Get(ctx context.Context, patientID string) (*PatientDashboardResponse, error) {

	patient, err := s.Patients.GetByID(ctx, patientID)
	if err != nil {
		return nil, err
	}

	appointments, _ := s.Appointments.ListForPatient(ctx, patientID, 10)

	var labs any
	var messages any
	var prescriptions any
	var invoices any

	if s.PatientPortal != nil {
		labs, _ = s.PatientPortal.ListLabResults(ctx, patientID, 10)
		messages, _ = s.PatientPortal.ListMessages(ctx, patientID, 10)
		prescriptions, _ = s.PatientPortal.ListPrescriptions(ctx, patientID, 10)
		invoices, _ = s.PatientPortal.ListInvoices(ctx, patientID, 10)
	}

	return &PatientDashboardResponse{
		Patient:       patient,
		Appointments:  appointments,
		Labs:          labs,
		Messages:      messages,
		Prescriptions: prescriptions,
		Invoices:      invoices,
	}, nil
}

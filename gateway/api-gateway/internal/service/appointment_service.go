package service

import (
	"context"
	"time"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type AppointmentService struct {
	repo *repository.Repository
}

func NewAppointmentService(repo *repository.Repository) *AppointmentService {
	return &AppointmentService{repo: repo}
}

func (s *AppointmentService) Create(
	ctx context.Context,
	patientID string,
	createdBy *string,
	scheduledAt time.Time,
	reason *string,
	notes *string,
	description *string,
	priority *string,
	appointmentType *string,
	serviceType *string,
	serviceCategory *string,
	facilityID *string,
	facilityName *string,
	facilityAddress *string,
	nearbyHospitalID *string,
	nearbyHospitalName *string,
	nearbyHospitalAddress *string,
	nearbyHospitalDistanceKm *float64,
	location *string,
) (*model.Appointment, error) {
	return s.repo.CreateAppointment(
		ctx,
		patientID,
		createdBy,
		scheduledAt,
		reason,
		notes,
		description,
		priority,
		appointmentType,
		serviceType,
		serviceCategory,
		facilityID,
		facilityName,
		facilityAddress,
		nearbyHospitalID,
		nearbyHospitalName,
		nearbyHospitalAddress,
		nearbyHospitalDistanceKm,
		location,
	)
}

func (s *AppointmentService) ListForPatient(ctx context.Context, patientID string, limit int) ([]*model.Appointment, error) {
	return s.repo.ListAppointmentsForPatient(ctx, patientID, limit)
}

func (s *AppointmentService) ListAll(ctx context.Context, limit int) ([]*model.Appointment, error) {
	return s.repo.ListAppointmentsAll(ctx, limit)
}

func (s *AppointmentService) ListForOrganization(ctx context.Context, organizationID string, limit int) ([]*model.Appointment, error) {
	return s.repo.ListAppointmentsForOrganization(ctx, organizationID, limit)
}

func (s *AppointmentService) GetByID(ctx context.Context, id string) (*model.Appointment, error) {
	return s.repo.GetAppointmentByID(ctx, id)
}

func (s *AppointmentService) Update(
	ctx context.Context,
	id string,
	scheduledAt *time.Time,
	status *string,
	reason *string,
	notes *string,
	description *string,
	priority *string,
	appointmentType *string,
	serviceType *string,
	serviceCategory *string,
	facilityID *string,
	facilityName *string,
	facilityAddress *string,
	nearbyHospitalID *string,
	nearbyHospitalName *string,
	nearbyHospitalAddress *string,
	nearbyHospitalDistanceKm *float64,
	location *string,
	assignedStaffType *string,
	assignedRoom *string,
	assignedEquipment *string,
) (*model.Appointment, error) {
	return s.repo.UpdateAppointment(
		ctx,
		id,
		scheduledAt,
		status,
		reason,
		notes,
		description,
		priority,
		appointmentType,
		serviceType,
		serviceCategory,
		facilityID,
		facilityName,
		facilityAddress,
		nearbyHospitalID,
		nearbyHospitalName,
		nearbyHospitalAddress,
		nearbyHospitalDistanceKm,
		location,
		assignedStaffType,
		assignedRoom,
		assignedEquipment,
	)
}

func (s *AppointmentService) Delete(ctx context.Context, id string) error {
	return s.repo.DeleteAppointment(ctx, id)
}

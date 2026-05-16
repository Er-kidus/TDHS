package service

import (
	"github.com/tenadam/api-gateway/config"
	"github.com/tenadam/api-gateway/internal/repository"
)

type Services struct {
	JWT             *JWTService
	Auth            *AuthService
	Patients        *PatientService
	Appointments    *AppointmentService
	PatientPortal    *PatientPortalService
	OrgApplications  *OrgApplicationService
	SDS              *SDSService
	PatientDashboard *PatientDashboardService
	Community        *CommunityService
	Pharmacy         *PharmacyService
}

func New(cfg *config.Config, repo *repository.Repository) *Services {
	jwtSvc := NewJWTService(cfg.JWTSecret)
	return &Services{
		JWT:             jwtSvc,
		Auth:            NewAuthService(repo, jwtSvc),
		Patients:        NewPatientService(repo),
		Appointments:    NewAppointmentService(repo),
		PatientPortal:   NewPatientPortalService(cfg, repo),
		OrgApplications: NewOrgApplicationService(repo.DB()),
		SDS:             NewSDSService(repo),
		PatientDashboard: NewPatientDashboardService(
			NewPatientService(repo),
			NewAppointmentService(repo),
			NewPatientPortalService(cfg, repo),
		),
		Community: NewCommunityService(repo),
		Pharmacy:  NewPharmacyService(repo),
	}
}

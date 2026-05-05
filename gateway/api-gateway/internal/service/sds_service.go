package service

import (
	"context"

	"github.com/tenadam/api-gateway/internal/model"
	"github.com/tenadam/api-gateway/internal/repository"
)

type SDSService struct {
	repo *repository.Repository
}

func NewSDSService(repo *repository.Repository) *SDSService {
	return &SDSService{repo: repo}
}

func (s *SDSService) ListServices(ctx context.Context) ([]*model.ServiceDefinition, error) {
	return s.repo.ListServices(ctx)
}

func (s *SDSService) CreateService(ctx context.Context, req *model.ServiceDefinition) (*model.ServiceDefinition, error) {
	return s.repo.CreateService(ctx, req)
}

func (s *SDSService) UpdateService(ctx context.Context, id string, req *model.ServiceDefinition) (*model.ServiceDefinition, error) {
	return s.repo.UpdateService(ctx, id, req)
}

func (s *SDSService) DeleteService(ctx context.Context, id string) error {
	return s.repo.DeleteService(ctx, id)
}

func (s *SDSService) ListResources(ctx context.Context) ([]*model.ResourcePool, error) {
	return s.repo.ListResources(ctx)
}

func (s *SDSService) AssignResources(ctx context.Context, appointmentID, staffType, room, equipment *string) (*model.Appointment, error) {
	return s.repo.AssignResources(ctx, appointmentID, staffType, room, equipment)
}

func (s *SDSService) ListQueueEntries(ctx context.Context) ([]*model.QueueEntry, error) {
	return s.repo.ListQueueEntries(ctx)
}

func (s *SDSService) ReorderQueue(ctx context.Context, queueID string, orderedAppointmentIDs []string) error {
	return s.repo.ReorderQueue(ctx, queueID, orderedAppointmentIDs)
}

func (s *SDSService) CheckInAppointment(ctx context.Context, appointmentID string) error {
	return s.repo.UpsertQueueEntryForAppointment(ctx, appointmentID)
}

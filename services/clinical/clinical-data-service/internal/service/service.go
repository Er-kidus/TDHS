package service

import "github.com/tenadam/clinical-data-service/internal/repository"

// Service handles business logic for clinical-data.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

package service

import "github.com/tenadam/clinical-guideline-service/internal/repository"

// Service handles business logic for clinical-guideline.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

package service

import "github.com/tenadam/data-quality-service/internal/repository"

// Service handles business logic for data-quality.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

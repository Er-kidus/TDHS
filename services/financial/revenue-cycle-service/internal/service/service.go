package service

import "github.com/tenadam/revenue-cycle-service/internal/repository"

// Service handles business logic for revenue-cycle.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

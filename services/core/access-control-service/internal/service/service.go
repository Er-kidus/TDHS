package service

import "github.com/tenadam/access-control-service/internal/repository"

// Service handles business logic for access-control.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

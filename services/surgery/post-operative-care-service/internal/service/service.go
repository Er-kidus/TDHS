package service

import "github.com/tenadam/post-operative-care-service/internal/repository"

// Service handles business logic for post-operative-care.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

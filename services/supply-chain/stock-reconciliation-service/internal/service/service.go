package service

import "github.com/tenadam/stock-reconciliation-service/internal/repository"

// Service handles business logic for stock-reconciliation.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

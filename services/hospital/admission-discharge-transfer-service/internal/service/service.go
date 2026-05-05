package service

import "github.com/tenadam/admission-discharge-transfer-service/internal/repository"

// Service handles business logic for admission-discharge-transfer.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

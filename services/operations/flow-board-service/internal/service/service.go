package service

import "github.com/tenadam/flow-board-service/internal/repository"

// Service handles business logic for flow-board.
type Service struct {
	repo *repository.Repository
}

// New creates a new Service.
func New(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

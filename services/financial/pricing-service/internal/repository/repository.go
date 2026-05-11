package repository

import "database/sql"

// Repository provides database access for pricing.
type Repository struct {
	db *sql.DB
}

// New creates a new Repository.
func New(db *sql.DB) *Repository {
	return &Repository{db: db}
}

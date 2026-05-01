package database

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"pharmacy-backend/internal/models"
)

type DB struct {
	*gorm.DB
}

func Initialize(databaseURL string) (*DB, error) {
	db, err := gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// Get underlying sql.DB to configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	return &DB{db}, nil
}

func NewDB() *DB {
	// This would typically get the database instance from a global variable or dependency injection
	// For now, we'll return nil and this will be properly implemented in the actual application
	return nil
}

// EMR System methods
func (db *DB) GetEMRSystem(id string) (*models.EMRSystem, error) {
	var emrSystem models.EMRSystem
	err := db.First(&emrSystem, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &emrSystem, nil
}

func (db *DB) GetEMRIntegrationLogs(emrSystemID string, limit, offset int) ([]models.EMRIntegrationLog, error) {
	var logs []models.EMRIntegrationLog
	err := db.Where("emr_system_id = ?", emrSystemID).
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&logs).Error
	return logs, err
}

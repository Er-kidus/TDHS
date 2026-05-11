package database

import (
	"pharmacy-backend/internal/models"
	"strings"

	"database/sql"

	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DB struct {
	*gorm.DB
}

func (db *DB) SQLDB() *sql.DB {
	sqlDB, _ := db.DB.DB()
	return sqlDB
}

func Initialize(databaseURL string) (*DB, error) {
	var db *gorm.DB
	var err error

	// Detect database type from URL
	if strings.HasPrefix(databaseURL, "postgres://") || strings.HasPrefix(databaseURL, "postgresql://") {
		// Use PostgreSQL
		db, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
	} else {
		// Use SQLite (default for local development)
		db, err = gorm.Open(sqlite.Open(databaseURL), &gorm.Config{})
	}

	if err != nil {
		return nil, err
	}

	// Auto-migrate models
	err = db.AutoMigrate(
		&models.User{},
		&models.Pharmacy{},
		&models.Medication{},
		&models.Prescription{},
		&models.Inventory{},
		&models.EMRSystem{},
		&models.EMRIntegrationLog{},
	)
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

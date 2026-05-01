package database

import (
	"fmt"
	"log"

	"pharmacy-system/pkg/config"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Connect() (*gorm.DB, error) {
	dsn := config.AppConfig.DatabaseURL
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&User{},
		&Hospital{},
		&Medicine{},
		&PharmacyInventory{},
		&Patient{},
		&Prescription{},
		&PrescriptionItem{},
		&SalesTransaction{},
		&InventoryTransaction{},
		&Supplier{},
		&PurchaseOrder{},
		&MedicalRecord{},
		&Allergy{},
		&Condition{},
	)
	
	if err != nil {
		return nil, fmt.Errorf("failed to migrate database: %w", err)
	}

	log.Println("Database connected and migrated successfully")
	DB = db
	return db, nil
}

func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

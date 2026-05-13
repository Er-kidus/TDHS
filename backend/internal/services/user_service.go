package services

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"pharmacy-backend/internal/models"
)

type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{db: db}
}

func (s *UserService) CreateUser(user *models.User) error {
	query := `
		INSERT INTO users (id, email, password_hash, first_name, last_name, phone, role, pharmacy_id, created_at, updated_at, is_active)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	user.ID = uuid.New()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()
	user.IsActive = true

	_, err := s.db.Exec(query,
		user.ID, user.Email, user.PasswordHash, user.FirstName, user.LastName,
		user.Phone, user.Role, user.PharmacyID, user.CreatedAt, user.UpdatedAt, user.IsActive,
	)

	return err
}

func (s *UserService) GetUserByID(id uuid.UUID) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, phone, role, pharmacy_id, created_at, updated_at, is_active
		FROM users WHERE id = $1
	`

	user := &models.User{}
	err := s.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.Phone, &user.Role, &user.PharmacyID, &user.CreatedAt, &user.UpdatedAt, &user.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, phone, role, pharmacy_id, created_at, updated_at, is_active
		FROM users WHERE email = $1
	`

	user := &models.User{}
	err := s.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
		&user.Phone, &user.Role, &user.PharmacyID, &user.CreatedAt, &user.UpdatedAt, &user.IsActive,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) GetUsers() ([]*models.User, error) {
	query := `
		SELECT id, email, password_hash, first_name, last_name, phone, role, pharmacy_id, created_at, updated_at, is_active
		FROM users WHERE is_active = true ORDER BY created_at DESC
	`

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID, &user.Email, &user.PasswordHash, &user.FirstName, &user.LastName,
			&user.Phone, &user.Role, &user.PharmacyID, &user.CreatedAt, &user.UpdatedAt, &user.IsActive,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (s *UserService) UpdateUser(user *models.User) error {
	query := `
		UPDATE users 
		SET first_name = $2, last_name = $3, phone = $4, role = $5, pharmacy_id = $6, updated_at = $7
		WHERE id = $1
	`

	user.UpdatedAt = time.Now()

	_, err := s.db.Exec(query,
		user.ID, user.FirstName, user.LastName, user.Phone, user.Role, user.PharmacyID, user.UpdatedAt,
	)

	return err
}

func (s *UserService) DeleteUser(id uuid.UUID) error {
	query := `UPDATE users SET is_active = false, updated_at = $2 WHERE id = $1`

	_, err := s.db.Exec(query, id, time.Now())
	return err
}

func (s *UserService) AuthenticateUser(email, password string) (*models.User, error) {
	user, err := s.GetUserByEmail(email)
	if err != nil {
		return nil, err
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password))
	if err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	return user, nil
}

func (s *UserService) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

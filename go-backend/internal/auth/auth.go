package auth

import (
	"errors"
	"time"

	"pharmacy-system/pkg/config"
	"pharmacy-system/pkg/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Service struct {
	db *gorm.DB
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email       string `json:"email" binding:"required,email"`
	Password    string `json:"password" binding:"required,min=6"`
	FirstName   string `json:"first_name" binding:"required"`
	LastName    string `json:"last_name" binding:"required"`
	Role        string `json:"role" binding:"required,oneof=admin pharmacist doctor hospital_staff patient"`
	NationalID  string `json:"national_id" binding:"required"`
	Phone       string `json:"phone"`
	HospitalID  string `json:"hospital_id"`
}

type AuthResponse struct {
	Token     string      `json:"token"`
	User      *models.User `json:"user"`
	ExpiresIn int         `json:"expires_in"`
}

func NewService(db *gorm.DB) *Service {
	return &Service{db: db}
}

func (s *Service) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		c.JSON(409, gin.H{"error": "User already exists"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to hash password"})
		return
	}

	// Parse hospital ID if provided
	var hospitalID *uuid.UUID
	if req.HospitalID != "" {
		parsedID, err := uuid.Parse(req.HospitalID)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid hospital ID"})
			return
		}
		hospitalID = &parsedID
	}

	// Create user
	user := models.User{
		Email:       req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Role:        req.Role,
		NationalID:  req.NationalID,
		Phone:       req.Phone,
		HospitalID:  hospitalID,
	}

	if err := s.db.Create(&user).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate token
	token, expiresIn, err := s.generateJWT(&user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(201, AuthResponse{
		Token:     token,
		User:      &user,
		ExpiresIn: expiresIn,
	})
}

func (s *Service) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request format"})
		return
	}

	// Find user
	var user models.User
	if err := s.db.Where("email = ?", req.Email).First(&user).Error; err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(401, gin.H{"error": "Invalid credentials"})
		return
	}

	// Generate token
	token, expiresIn, err := s.generateJWT(&user)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(200, AuthResponse{
		Token:     token,
		User:      &user,
		ExpiresIn: expiresIn,
	})
}

func (s *Service) RefreshToken(c *gin.Context) {
	// Implementation for token refresh
	c.JSON(501, gin.H{"error": "Token refresh not implemented"})
}

func (s *Service) Logout(c *gin.Context) {
	// Implementation for logout (token blacklisting)
	c.JSON(200, gin.H{"message": "Logged out successfully"})
}

func (s *Service) GetProfile(c *gin.Context) {
	// Get user from JWT token (middleware should set this)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var user models.User
	if err := s.db.Where("id = ?", userID).First(&user).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	c.JSON(200, gin.H{"user": user})
}

func (s *Service) generateJWT(user *models.User) (string, int, error) {
	claims := jwt.MapClaims{
		"user_id":    user.ID.String(),
		"email":      user.Email,
		"role":       user.Role,
		"hospital_id": user.HospitalID,
		"exp":        time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(config.AppConfig.JWTSecret))
	if err != nil {
		return "", 0, err
	}

	return tokenString, 86400, nil // 24 hours in seconds
}

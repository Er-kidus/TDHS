package handlers

import (
	"net/http"
	"strings"

	"pharmacy-backend/internal/api/middleware"
	"pharmacy-backend/internal/models"
	"pharmacy-backend/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AuthHandler struct {
	userService *services.UserService
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email      string  `json:"email" binding:"required,email"`
	Password   string  `json:"password" binding:"required,min=6"`
	FirstName  string  `json:"first_name" binding:"required"`
	LastName   string  `json:"last_name" binding:"required"`
	Phone      string  `json:"phone"`
	Role       string  `json:"role" binding:"required,oneof=admin pharmacist technician doctor patient"`
	PharmacyID *string `json:"pharmacy_id"`
}

type AuthResponse struct {
	Token string       `json:"token"`
	User  *models.User `json:"user"`
}

func NewAuthHandler(userService *services.UserService) *AuthHandler {
	return &AuthHandler{userService: userService}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userService.AuthenticateUser(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	if !user.IsActive {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is deactivated"})
		return
	}

	// Generate JWT token
	jwtSecret := c.GetString("jwt_secret")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key" // fallback
	}

	var pharmacyIDStr *string
	if user.PharmacyID != nil {
		pid := user.PharmacyID.String()
		pharmacyIDStr = &pid
	}

	token, err := middleware.GenerateJWT(user.ID.String(), user.Email, string(user.Role), pharmacyIDStr, jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Clear password hash before returning
	user.PasswordHash = ""

	response := AuthResponse{
		Token: token,
		User:  user,
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if user already exists
	existingUser, err := h.userService.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}

	// Hash password
	hashedPassword, err := h.userService.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Parse pharmacy ID if provided
	var pharmacyID *uuid.UUID
	if req.PharmacyID != nil && *req.PharmacyID != "" {
		pid, err := uuid.Parse(*req.PharmacyID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid pharmacy ID"})
			return
		}
		pharmacyID = &pid
	}

	// Create user
	user := &models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Phone:        &req.Phone,
		Role:         models.UserRole(req.Role),
		PharmacyID:   pharmacyID,
	}

	if err := h.userService.CreateUser(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Generate JWT token
	jwtSecret := c.GetString("jwt_secret")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key" // fallback
	}

	var pharmacyIDStr *string
	if user.PharmacyID != nil {
		pid := user.PharmacyID.String()
		pharmacyIDStr = &pid
	}

	token, err := middleware.GenerateJWT(user.ID.String(), user.Email, string(user.Role), pharmacyIDStr, jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Clear password hash before returning
	user.PasswordHash = ""

	response := AuthResponse{
		Token: token,
		User:  user,
	}

	c.JSON(http.StatusCreated, response)
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		return
	}

	tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

	// Get JWT secret from environment
	jwtSecret := c.GetString("jwt_secret")
	if jwtSecret == "" {
		jwtSecret = "your-secret-key" // fallback
	}

	// Parse and validate token
	token, err := jwt.ParseWithClaims(tokenString, &middleware.Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(jwtSecret), nil
	})

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		return
	}

	if claims, ok := token.Claims.(*middleware.Claims); ok && token.Valid {
		// Get user from database
		user, err := h.userService.GetUserByID(uuid.MustParse(claims.UserID))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		if !user.IsActive {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Account is deactivated"})
			return
		}

		// Generate new token
		var pharmacyIDStr *string
		if user.PharmacyID != nil {
			pid := user.PharmacyID.String()
			pharmacyIDStr = &pid
		}

		newToken, err := middleware.GenerateJWT(user.ID.String(), user.Email, string(user.Role), pharmacyIDStr, jwtSecret)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
			return
		}

		// Clear password hash before returning
		user.PasswordHash = ""

		response := AuthResponse{
			Token: newToken,
			User:  user,
		}

		c.JSON(http.StatusOK, response)
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
	}
}

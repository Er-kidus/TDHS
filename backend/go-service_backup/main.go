package main

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v4/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

type App struct {
	Router *mux.Router
	DB     *pgxpool.Pool
	JWTKey []byte
}

type User struct {
	ID         int    `json:"id"`
	Email      string `json:"email"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Role       string `json:"role"`
	PharmacyID *int   `json:"pharmacy_id"`
}

type Patient struct {
	ID                       int      `json:"id"`
	NationalID              string   `json:"national_id"`
	FirstName                string   `json:"first_name"`
	LastName                 string   `json:"last_name"`
	DateOfBirth              string   `json:"date_of_birth"`
	Phone                    string   `json:"phone"`
	Email                    *string  `json:"email"`
	Address                  *string  `json:"address"`
	BloodType                *string  `json:"blood_type"`
	Allergies                []string `json:"allergies"`
	ChronicConditions        []string `json:"chronic_conditions"`
	EmergencyContactName     *string  `json:"emergency_contact_name"`
	EmergencyContactPhone    *string  `json:"emergency_contact_phone"`
}

type Prescription struct {
	ID                int       `json:"id"`
	PrescriptionNumber string   `json:"prescription_number"`
	PatientID         int       `json:"patient_id"`
	MedicationID      int       `json:"medication_id"`
	PrescriberID      *int      `json:"prescriber_id"`
	Dosage            string    `json:"dosage"`
	Frequency         string    `json:"frequency"`
	Duration          *int      `json:"duration"`
	Quantity          int       `json:"quantity"`
	Instructions       *string   `json:"instructions"`
	DatePrescribed     time.Time `json:"date_prescribed"`
	DateFilled        *time.Time `json:"date_filled"`
	Status            string    `json:"status"`
	PharmacistID      *int      `json:"pharmacist_id"`
	QRCodeHash        *string   `json:"qr_code_hash"`
	Notes             *string   `json:"notes"`
}

type Medication struct {
	ID                 int      `json:"id"`
	Name               string   `json:"name"`
	GenericName        *string  `json:"generic_name"`
	NDCCode            *string  `json:"ndc_code"`
	Category           *string  `json:"category"`
	Manufacturer       *string  `json:"manufacturer"`
	Strength           *string  `json:"strength"`
	Form               *string  `json:"form"`
	IsControlledSubstance bool   `json:"is_controlled_substance"`
	Schedule           *int     `json:"schedule"`
}

type Inventory struct {
	ID             int     `json:"id"`
	PharmacyID     int     `json:"pharmacy_id"`
	MedicationID   int     `json:"medication_id"`
	BatchNumber    *string `json:"batch_number"`
	ExpiryDate     *string `json:"expiry_date"`
	QuantityOnHand int     `json:"quantity_on_hand"`
	ReorderLevel   int     `json:"reorder_level"`
	UnitCost       *float64 `json:"unit_cost"`
	UnitPrice      *float64 `json:"unit_price"`
	StorageLocation *string `json:"storage_location"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	PharmacyID *int   `json:"pharmacy_id"`
}

type Claims struct {
	ID         int    `json:"id"`
	Email      string `json:"email"`
	Role       string `json:"role"`
	PharmacyID *int   `json:"pharmacy_id"`
	jwt.StandardClaims
}

func (app *App) Initialize(user, password, dbname, host, port string) {
	connectionString := fmt.Sprintf("user=%s password=%s dbname=%s host=%s port=%s sslmode=disable", user, password, dbname, host, port)

	var err error
	app.DB, err = pgxpool.Connect(context.Background(), connectionString)
	if err != nil {
		log.Fatal("Unable to connect to database:", err)
	}

	app.Router = mux.NewRouter()
	app.JWTKey = []byte(os.Getenv("JWT_SECRET"))
	if len(app.JWTKey) == 0 {
		app.JWTKey = []byte("your-secret-key-change-in-production")
	}

	app.initializeRoutes()
}

func (app *App) Run(addr string) {
	log.Printf("Starting Go microservice on %s", addr)
	log.Fatal(http.ListenAndServe(addr, app.Router))
}

func (app *App) initializeRoutes() {
	app.Router.HandleFunc("/health", app.healthCheck).Methods("GET")
	
	// Auth routes
	app.Router.HandleFunc("/api/v1/auth/login", app.login).Methods("POST")
	app.Router.HandleFunc("/api/v1/auth/register", app.register).Methods("POST")
	
	// Protected routes
	protected := app.Router.PathPrefix("/api/v1").Subrouter()
	protected.Use(app.authMiddleware)
	
	protected.HandleFunc("/users/profile", app.getUserProfile).Methods("GET")
	protected.HandleFunc("/pharmacies", app.getPharmacies).Methods("GET")
	protected.HandleFunc("/patients", app.getPatients).Methods("GET")
	protected.HandleFunc("/medications", app.getMedications).Methods("GET")
	protected.HandleFunc("/prescriptions", app.getPrescriptions).Methods("GET")
	protected.HandleFunc("/prescriptions", app.createPrescription).Methods("POST")
	protected.HandleFunc("/prescriptions/{id}", app.updatePrescription).Methods("PUT")
	protected.HandleFunc("/inventory", app.getInventory).Methods("GET")
	protected.HandleFunc("/inventory/low-stock", app.getLowStock).Methods("GET")
	protected.HandleFunc("/inventory/{id}", app.updateInventory).Methods("PUT")
	protected.HandleFunc("/analytics/overview", app.getAnalytics).Methods("GET")
}

func (app *App) healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"timestamp": time.Now().UTC(),
		"service":   "go-microservice",
		"database":  "connected",
	})
}

func (app *App) authMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		tokenString := authHeader[7:]
		claims := &Claims{}

		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return app.JWTKey, nil
		})

		if err != nil || !token.Valid {
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "user", claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (app *App) login(w http.ResponseWriter, r *http.Request) {
	var req LoginRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password required", http.StatusBadRequest)
		return
	}

	var user User
	err = app.DB.QueryRow(context.Background(),
		"SELECT id, email, password_hash, first_name, last_name, role, pharmacy_id FROM users WHERE email = $1 AND is_active = true",
		req.Email).Scan(&user.ID, &user.Email, new(string), &user.FirstName, &user.LastName, &user.Role, &user.PharmacyID)

	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// In production, verify password hash here
	// For now, we'll skip password verification for demo

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		ID:         user.ID,
		Email:      user.Email,
		Role:       user.Role,
		PharmacyID: user.PharmacyID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
		},
	})

	tokenString, err := token.SignedString(app.JWTKey)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

func (app *App) register(w http.ResponseWriter, r *http.Request) {
	var req RegisterRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" || req.FirstName == "" || req.LastName == "" || req.Role == "" {
		http.Error(w, "All required fields must be provided", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Error hashing password", http.StatusInternalServerError)
		return
	}

	var user User
	err = app.DB.QueryRow(context.Background(),
		"INSERT INTO users (email, password_hash, first_name, last_name, role, pharmacy_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, first_name, last_name, role, pharmacy_id",
		req.Email, string(hashedPassword), req.FirstName, req.LastName, req.Role, req.PharmacyID).Scan(&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.Role, &user.PharmacyID)

	if err != nil {
		http.Error(w, "Error creating user", http.StatusInternalServerError)
		return
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		ID:         user.ID,
		Email:      user.Email,
		Role:       user.Role,
		PharmacyID: user.PharmacyID,
		StandardClaims: jwt.StandardClaims{
			ExpiresAt: time.Now().Add(24 * time.Hour).Unix(),
		},
	})

	tokenString, err := token.SignedString(app.JWTKey)
	if err != nil {
		http.Error(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"token": tokenString,
		"user":  user,
	})
}

func (app *App) getUserProfile(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var user User
	err := app.DB.QueryRow(context.Background(),
		"SELECT id, email, first_name, last_name, role, pharmacy_id FROM users WHERE id = $1",
		claims.ID).Scan(&user.ID, &user.Email, &user.FirstName, &user.LastName, &user.Role, &user.PharmacyID)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

func (app *App) getPharmacies(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var query string
	var args []interface{}

	if claims.Role == "admin" {
		query = "SELECT id, name, license_number, address, phone, email, is_active FROM pharmacies WHERE is_active = true"
	} else {
		query = "SELECT id, name, license_number, address, phone, email, is_active FROM pharmacies WHERE id = $1 AND is_active = true"
		args = append(args, claims.PharmacyID)
	}

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching pharmacies", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var pharmacies []map[string]interface{}
	for rows.Next() {
		var id int
		var name, licenseNumber, address, phone, email string
		var isActive bool

		err := rows.Scan(&id, &name, &licenseNumber, &address, &phone, &email, &isActive)
		if err != nil {
			continue
		}

		pharmacies = append(pharmacies, map[string]interface{}{
			"id":            id,
			"name":          name,
			"license_number": licenseNumber,
			"address":       address,
			"phone":         phone,
			"email":         email,
			"is_active":     isActive,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(pharmacies)
}

func (app *App) getPatients(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	
	var query string
	var args []interface{}

	query = `SELECT id, national_id, first_name, last_name, date_of_birth, phone, email, 
			blood_type, allergies, chronic_conditions, emergency_contact_name, emergency_contact_phone 
			FROM patients`

	if search != "" {
		query += " WHERE first_name ILIKE $1 OR last_name ILIKE $1 OR national_id ILIKE $1 OR phone ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY last_name, first_name LIMIT 50"

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching patients", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var patients []Patient
	for rows.Next() {
		var patient Patient
		err := rows.Scan(&patient.ID, &patient.NationalID, &patient.FirstName, &patient.LastName,
			&patient.DateOfBirth, &patient.Phone, &patient.Email, &patient.BloodType,
			&patient.Allergies, &patient.ChronicConditions, &patient.EmergencyContactName, &patient.EmergencyContactPhone)
		if err != nil {
			continue
		}
		patients = append(patients, patient)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(patients)
}

func (app *App) getMedications(w http.ResponseWriter, r *http.Request) {
	search := r.URL.Query().Get("search")
	
	var query string
	var args []interface{}

	query = "SELECT id, name, generic_name, ndc_code, category, manufacturer, strength, form, is_controlled_substance, schedule FROM medications"

	if search != "" {
		query += " WHERE name ILIKE $1 OR generic_name ILIKE $1 OR ndc_code ILIKE $1"
		args = append(args, "%"+search+"%")
	}

	query += " ORDER BY name LIMIT 100"

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching medications", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var medications []Medication
	for rows.Next() {
		var med Medication
		err := rows.Scan(&med.ID, &med.Name, &med.GenericName, &med.NDCCode, &med.Category,
			&med.Manufacturer, &med.Strength, &med.Form, &med.IsControlledSubstance, &med.Schedule)
		if err != nil {
			continue
		}
		medications = append(medications, med)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(medications)
}

func (app *App) getPrescriptions(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var query string
	var args []interface{}

	query = `SELECT p.id, p.prescription_number, p.patient_id, p.medication_id, p.prescriber_id,
			p.dosage, p.frequency, p.duration, p.quantity, p.instructions, p.date_prescribed,
			p.date_filled, p.status, p.pharmacist_id, p.qr_code_hash, p.notes,
			pa.first_name || ' ' || pa.last_name as patient_name,
			m.name as medication_name,
			u.first_name || ' ' || u.last_name as prescriber_name
			FROM prescriptions p
			JOIN patients pa ON p.patient_id = pa.id
			JOIN medications m ON p.medication_id = m.id
			LEFT JOIN users u ON p.prescriber_id = u.id`

	if claims.Role != "admin" {
		query += " WHERE p.pharmacy_id = $1"
		args = append(args, claims.PharmacyID)
	}

	query += " ORDER BY p.date_prescribed DESC LIMIT 100"

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching prescriptions", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var prescriptions []map[string]interface{}
	for rows.Next() {
		var id int
		var prescriptionNumber, dosage, frequency, instructions, status, patientName, medicationName, prescriberName string
		var patientID, medicationID, quantity int
		var prescriberID, pharmacistID, duration *int
		var datePrescribed time.Time
		var dateFilled *time.Time
		var qrCodeHash, notes *string

		err := rows.Scan(&id, &prescriptionNumber, &patientID, &medicationID, &prescriberID,
			&dosage, &frequency, &duration, &quantity, &instructions, &datePrescribed,
			&dateFilled, &status, &pharmacistID, &qrCodeHash, &notes,
			&patientName, &medicationName, &prescriberName)
		if err != nil {
			continue
		}

		prescriptions = append(prescriptions, map[string]interface{}{
			"id":                   id,
			"prescription_number": prescriptionNumber,
			"patient_id":           patientID,
			"medication_id":        medicationID,
			"prescriber_id":        prescriberID,
			"dosage":               dosage,
			"frequency":            frequency,
			"duration":             duration,
			"quantity":             quantity,
			"instructions":         instructions,
			"date_prescribed":      datePrescribed,
			"date_filled":          dateFilled,
			"status":               status,
			"pharmacist_id":        pharmacistID,
			"qr_code_hash":         qrCodeHash,
			"notes":                notes,
			"patient_name":         patientName,
			"medication_name":      medicationName,
			"prescriber_name":      prescriberName,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(prescriptions)
}

func (app *App) createPrescription(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var prescription Prescription
	err := json.NewDecoder(r.Body).Decode(&prescription)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Generate prescription number and QR hash
	prescription.PrescriptionNumber = "RX" + strconv.FormatInt(time.Now().Unix(), 10)
	hash := sha256.Sum256([]byte(prescription.PrescriptionNumber))
	qrHash := hex.EncodeToString(hash[:])
	prescription.QRCodeHash = &qrHash

	err = app.DB.QueryRow(context.Background(),
		`INSERT INTO prescriptions (prescription_number, patient_id, medication_id, prescriber_id,
		 dosage, frequency, duration, quantity, instructions, qr_code_hash, pharmacy_id)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
		prescription.PrescriptionNumber, prescription.PatientID, prescription.MedicationID,
		claims.ID, prescription.Dosage, prescription.Frequency, prescription.Duration,
		prescription.Quantity, prescription.Instructions, prescription.QRCodeHash, claims.PharmacyID).Scan(&prescription.ID)

	if err != nil {
		http.Error(w, "Error creating prescription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(prescription)
}

func (app *App) updatePrescription(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid prescription ID", http.StatusBadRequest)
		return
	}

	var updates map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	status, ok := updates["status"].(string)
	if !ok {
		http.Error(w, "Status is required", http.StatusBadRequest)
		return
	}

	var query string
	var args []interface{}

	if status == "filled" {
		claims := r.Context().Value("user").(*Claims)
		query = "UPDATE prescriptions SET status = $1, date_filled = CURRENT_TIMESTAMP, pharmacist_id = $2 WHERE id = $3"
		args = append(args, status, claims.ID, id)
	} else {
		query = "UPDATE prescriptions SET status = $1 WHERE id = $2"
		args = append(args, status, id)
	}

	_, err = app.DB.Exec(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error updating prescription", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Prescription updated successfully"})
}

func (app *App) getInventory(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var query string
	var args []interface{}

	query = `SELECT i.id, i.pharmacy_id, i.medication_id, i.batch_number, i.expiry_date,
			i.quantity_on_hand, i.reorder_level, i.unit_cost, i.unit_price, i.storage_location,
			m.name as medication_name, m.generic_name, m.category
			FROM inventory i
			JOIN medications m ON i.medication_id = m.id`

	if claims.Role != "admin" {
		query += " WHERE i.pharmacy_id = $1"
		args = append(args, claims.PharmacyID)
	}

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching inventory", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var inventory []map[string]interface{}
	for rows.Next() {
		var id, pharmacyID, medicationID, quantityOnHand, reorderLevel int
		var batchNumber, expiryDate, storageLocation, medicationName, genericName, category string
		var unitCost, unitPrice *float64

		err := rows.Scan(&id, &pharmacyID, &medicationID, &batchNumber, &expiryDate,
			&quantityOnHand, &reorderLevel, &unitCost, &unitPrice, &storageLocation,
			&medicationName, &genericName, &category)
		if err != nil {
			continue
		}

		inventory = append(inventory, map[string]interface{}{
			"id":               id,
			"pharmacy_id":      pharmacyID,
			"medication_id":    medicationID,
			"batch_number":     batchNumber,
			"expiry_date":      expiryDate,
			"quantity_on_hand": quantityOnHand,
			"reorder_level":    reorderLevel,
			"unit_cost":        unitCost,
			"unit_price":       unitPrice,
			"storage_location": storageLocation,
			"medication_name":  medicationName,
			"generic_name":     genericName,
			"category":         category,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(inventory)
}

func (app *App) getLowStock(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var query string
	var args []interface{}

	query = `SELECT i.id, i.pharmacy_id, i.medication_id, i.batch_number, i.expiry_date,
			i.quantity_on_hand, i.reorder_level, i.unit_cost, i.unit_price, i.storage_location,
			m.name as medication_name, m.generic_name, m.category
			FROM inventory i
			JOIN medications m ON i.medication_id = m.id
			WHERE i.quantity_on_hand <= i.reorder_level`

	if claims.Role != "admin" {
		query += " AND i.pharmacy_id = $1"
		args = append(args, claims.PharmacyID)
	}

	rows, err := app.DB.Query(context.Background(), query, args...)
	if err != nil {
		http.Error(w, "Error fetching low stock items", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var lowStock []map[string]interface{}
	for rows.Next() {
		var id, pharmacyID, medicationID, quantityOnHand, reorderLevel int
		var batchNumber, expiryDate, storageLocation, medicationName, genericName, category string
		var unitCost, unitPrice *float64

		err := rows.Scan(&id, &pharmacyID, &medicationID, &batchNumber, &expiryDate,
			&quantityOnHand, &reorderLevel, &unitCost, &unitPrice, &storageLocation,
			&medicationName, &genericName, &category)
		if err != nil {
			continue
		}

		lowStock = append(lowStock, map[string]interface{}{
			"id":               id,
			"pharmacy_id":      pharmacyID,
			"medication_id":    medicationID,
			"batch_number":     batchNumber,
			"expiry_date":      expiryDate,
			"quantity_on_hand": quantityOnHand,
			"reorder_level":    reorderLevel,
			"unit_cost":        unitCost,
			"unit_price":       unitPrice,
			"storage_location": storageLocation,
			"medication_name":  medicationName,
			"generic_name":     genericName,
			"category":         category,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lowStock)
}

func (app *App) updateInventory(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, "Invalid inventory ID", http.StatusBadRequest)
		return
	}

	var updates map[string]interface{}
	err = json.NewDecoder(r.Body).Decode(&updates)
	if err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	quantityOnHand, ok := updates["quantity_on_hand"].(float64)
	if !ok {
		http.Error(w, "Quantity on hand is required", http.StatusBadRequest)
		return
	}

	_, err = app.DB.Exec(context.Background(),
		"UPDATE inventory SET quantity_on_hand = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
		int(quantityOnHand), id)

	if err != nil {
		http.Error(w, "Error updating inventory", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Inventory updated successfully"})
}

func (app *App) getAnalytics(w http.ResponseWriter, r *http.Request) {
	claims := r.Context().Value("user").(*Claims)

	var pharmacyFilter string
	var args []interface{}

	if claims.Role != "admin" {
		pharmacyFilter = "WHERE pharmacy_id = $1"
		args = append(args, claims.PharmacyID)
	}

	// Get analytics data
	totalPrescriptions := 0
	filledPrescriptions := 0
	totalInventory := 0
	lowStockCount := 0
	totalPatients := 0

	app.DB.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM prescriptions "+pharmacyFilter, args...).Scan(&totalPrescriptions)

	if claims.Role != "admin" {
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM prescriptions WHERE status = 'filled' AND pharmacy_id = $1", claims.PharmacyID).Scan(&filledPrescriptions)
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM inventory WHERE pharmacy_id = $1", claims.PharmacyID).Scan(&totalInventory)
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM inventory WHERE quantity_on_hand <= reorder_level AND pharmacy_id = $1", claims.PharmacyID).Scan(&lowStockCount)
	} else {
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM prescriptions WHERE status = 'filled'").Scan(&filledPrescriptions)
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM inventory").Scan(&totalInventory)
		app.DB.QueryRow(context.Background(),
			"SELECT COUNT(*) FROM inventory WHERE quantity_on_hand <= reorder_level").Scan(&lowStockCount)
	}

	app.DB.QueryRow(context.Background(),
		"SELECT COUNT(*) FROM patients").Scan(&totalPatients)

	analytics := map[string]interface{}{
		"total_prescriptions": totalPrescriptions,
		"filled_prescriptions": filledPrescriptions,
		"total_inventory":     totalInventory,
		"low_stock_count":     lowStockCount,
		"total_patients":      totalPatients,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(analytics)
}

func main() {
	app := &App{}

	// Database connection parameters
	dbUser := os.Getenv("DB_USER")
	if dbUser == "" {
		dbUser = "postgres"
	}
	
	dbPassword := os.Getenv("DB_PASSWORD")
	if dbPassword == "" {
		dbPassword = "password"
	}
	
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "pharmacy_db"
	}
	
	dbHost := os.Getenv("DB_HOST")
	if dbHost == "" {
		dbHost = "localhost"
	}
	
	dbPort := os.Getenv("DB_PORT")
	if dbPort == "" {
		dbPort = "5432"
	}

	app.Initialize(dbUser, dbPassword, dbName, dbHost, dbPort)
	app.Run(":8081")
}

package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func main() {
	// Setup Gin router
	r := gin.Default()
	
	// CORS middleware
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		
		c.Next()
	})

	// Service URLs
	authServiceURL := getEnv("AUTH_SERVICE_URL", "http://localhost:8001")
	pharmacyServiceURL := getEnv("PHARMACY_SERVICE_URL", "http://localhost:8002")
	emrServiceURL := getEnv("EMR_SERVICE_URL", "http://localhost:8003")
	prescriptionServiceURL := getEnv("PRESCRIPTION_SERVICE_URL", "http://localhost:8004")

	// Proxy middleware
	r.Any("/api/v1/auth/*path", gin.WrapH(proxyHandler(authServiceURL)))
	r.Any("/api/v1/pharmacy/*path", gin.WrapH(proxyHandler(pharmacyServiceURL)))
	r.Any("/api/v1/emr/*path", gin.WrapH(proxyHandler(emrServiceURL)))
	r.Any("/api/v1/prescriptions/*path", gin.WrapH(proxyHandler(prescriptionServiceURL)))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"service": "api-gateway",
			"services": map[string]string{
				"auth":        authServiceURL,
				"pharmacy":    pharmacyServiceURL,
				"emr":          emrServiceURL,
				"prescription": prescriptionServiceURL,
			},
		})
	})

	port := os.Getenv("API_GATEWAY_PORT")
	if port == "" {
		port = "8080"
	}
	
	log.Printf("API Gateway starting on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func proxyHandler(targetURL string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Create target URL
		target := targetURL + r.URL.Path
		
		// Handle query parameters
		if r.URL.RawQuery != "" {
			target += "?" + r.URL.RawQuery
		}

		// Create new request
		proxyReq, err := http.NewRequest(r.Method, target, r.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		// Copy headers
		for name, values := range r.Header {
			// Skip hop-by-hop headers
			if strings.ToLower(name) == "host" || strings.ToLower(name) == "connection" {
				continue
			}
			for _, value := range values {
				proxyReq.Header.Add(name, value)
			}
		}

		// Send request
		client := &http.Client{}
		resp, err := client.Do(proxyReq)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		defer resp.Body.Close()

		// Copy response headers
		for name, values := range resp.Header {
			for _, value := range values {
				w.Header().Add(name, value)
			}
		}

		// Copy response status
		w.WriteHeader(resp.StatusCode)

		// Copy response body
		_, err = w.Copy(w, resp.Body)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

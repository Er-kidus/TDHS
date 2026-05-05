package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/Er-kidus/Tenadam/services/front-door/internal/handler"
	"github.com/Er-kidus/Tenadam/services/front-door/internal/service"
)

func main() {
	// Prioritize FRONT_DOOR_PORT from docker-compose
	port := strings.TrimSpace(os.Getenv("FRONT_DOOR_PORT"))
	if port == "" {
		port = strings.TrimSpace(os.Getenv("PORT"))
	}
	if port == "" {
		port = "8090" // Defaulting to our new host port
	}

	registryBaseURL := strings.TrimSpace(os.Getenv("REGISTRY_BASE_URL"))
	if registryBaseURL == "" {
		registryBaseURL = "http://localhost:8080" // Pointing to gateway default
	}

	registryClient := service.NewRegistryClient(registryBaseURL)
	h := handler.New(registryClient)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	log.Printf("front-door listening on :%s (registry=%s)", port, registryBaseURL)
	// Ensure the colon is handled correctly
	listenAddr := ":" + port
	if !strings.HasPrefix(port, ":") {
		listenAddr = ":" + port
	} else {
		listenAddr = port
	}

	if err := http.ListenAndServe(listenAddr, mux); err != nil {
		log.Fatal(err)
	}
}
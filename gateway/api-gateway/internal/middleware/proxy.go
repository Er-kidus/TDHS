package middleware

import (
	"net/http"
	"strings"

	"github.com/tenadam/api-gateway/config"
)

func CORS(cfg *config.Config, next http.Handler) http.Handler {
	allowed := cfg.CORSAllowedOrigins
	if strings.TrimSpace(allowed) == "" {
		allowed = "http://localhost:3000,http://localhost:4000"
	}
	allowedSet := map[string]struct{}{}
	for _, origin := range strings.Split(allowed, ",") {
		origin = strings.TrimSpace(origin)
		if origin != "" {
			allowedSet[origin] = struct{}{}
		}
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			if _, ok := allowedSet[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Vary", "Origin")
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			}
		}

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

package config

import "os"

type Config struct {
	Port               string
	DatabaseURL        string
	RedisURL           string
	JWTSecret          string
	CORSAllowedOrigins string
	LiveKitURL         string
	LiveKitPublicURL   string
	LiveKitAPIKey      string
	LiveKitAPISecret   string
	GeminiAPIKey       string
	GeminiModel        string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}
	return &Config{
		Port:               port,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		RedisURL:           os.Getenv("REDIS_URL"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		CORSAllowedOrigins: os.Getenv("CORS_ALLOWED_ORIGINS"),
		LiveKitURL:         os.Getenv("LIVEKIT_URL"),
		LiveKitPublicURL:   os.Getenv("LIVEKIT_PUBLIC_URL"),
		LiveKitAPIKey:      os.Getenv("LIVEKIT_API_KEY"),
		LiveKitAPISecret:   os.Getenv("LIVEKIT_API_SECRET"),
		GeminiAPIKey:       os.Getenv("GEMINI_API_KEY"),
		GeminiModel: func() string {
			if v := os.Getenv("GEMINI_MODEL"); v != "" {
				return v
			}
			return "gemini-2.5-flash"
		}(),
	}
}

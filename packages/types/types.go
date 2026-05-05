package types

import "time"

type ID = string

type Meta struct {
CreatedAt time.Time  `json:"created_at"`
UpdatedAt time.Time  `json:"updated_at"`
DeletedAt *time.Time `json:"deleted_at,omitempty"`
}

type Pagination struct {
Page     int `json:"page"`
PageSize int `json:"page_size"`
Total    int `json:"total"`
}

type APIResponse[T any] struct {
Data    T      `json:"data"`
Message string `json:"message,omitempty"`
Error   string `json:"error,omitempty"`
}

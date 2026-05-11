package authclient

import (
"context"
"errors"
"net/http"
)

type Claims struct {
UserID   string
TenantID string
Roles    []string
}

type Client struct {
baseURL    string
httpClient *http.Client
}

func New(baseURL string) *Client {
return &Client{baseURL: baseURL, httpClient: http.DefaultClient}
}

func (c *Client) Validate(ctx context.Context, token string) (*Claims, error) {
if token == "" {
return nil, errors.New("empty token")
}
// TODO: call auth-service /validate endpoint
return &Claims{}, nil
}

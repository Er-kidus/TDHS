FROM golang:1.25-alpine AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/api-gateway ./cmd/main.go

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/api-gateway /bin/api-gateway
EXPOSE 8080
ENTRYPOINT ["/bin/api-gateway"]

FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/remote-monitoring-service ./cmd/main.go

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/remote-monitoring-service /bin/remote-monitoring-service
EXPOSE 8080
ENTRYPOINT ["/bin/remote-monitoring-service"]

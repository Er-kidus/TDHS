FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/emergency-triage-protocol-service ./cmd/main.go

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/emergency-triage-protocol-service /bin/emergency-triage-protocol-service
EXPOSE 8080
ENTRYPOINT ["/bin/emergency-triage-protocol-service"]

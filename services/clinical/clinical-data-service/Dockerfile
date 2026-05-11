FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/clinical-data-service ./cmd/main.go

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/clinical-data-service /bin/clinical-data-service
EXPOSE 8080
ENTRYPOINT ["/bin/clinical-data-service"]

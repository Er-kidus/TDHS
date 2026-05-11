FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod .
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/ussd-app ./cmd/main.go

FROM gcr.io/distroless/static:nonroot
COPY --from=builder /bin/ussd-app /bin/ussd-app
EXPOSE 9090
ENTRYPOINT ["/bin/ussd-app"]

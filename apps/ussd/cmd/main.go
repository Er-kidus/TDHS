package main

import (
"log"
"net/http"
)

func main() {
mux := http.NewServeMux()
mux.HandleFunc("/ussd", ussdHandler)
log.Println("USSD service listening on :9090")
log.Fatal(http.ListenAndServe(":9090", mux))
}

func ussdHandler(w http.ResponseWriter, r *http.Request) {
w.Header().Set("Content-Type", "text/plain")
w.Write([]byte("CON Welcome to Tenadam Health\n1. Book Appointment\n2. Check Results\n3. Emergency"))
}

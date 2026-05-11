package db

import (
"database/sql"
"fmt"

_ "github.com/lib/pq"
)

func Connect(dsn string) (*sql.DB, error) {
db, err := sql.Open("postgres", dsn)
if err != nil {
return nil, fmt.Errorf("db.Connect: %w", err)
}
if err := db.Ping(); err != nil {
return nil, fmt.Errorf("db.Ping: %w", err)
}
return db, nil
}

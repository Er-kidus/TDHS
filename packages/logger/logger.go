package logger

import (
"log/slog"
"os"
)

var Default = slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
Level: slog.LevelInfo,
}))

func Info(msg string, args ...any) {
Default.Info(msg, args...)
}

func Error(msg string, args ...any) {
Default.Error(msg, args...)
}

func Debug(msg string, args ...any) {
Default.Debug(msg, args...)
}

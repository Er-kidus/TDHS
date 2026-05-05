package events

import "context"

type Event struct {
Type    string
Payload map[string]any
}

type Publisher interface {
Publish(ctx context.Context, topic string, event Event) error
}

type Subscriber interface {
Subscribe(ctx context.Context, topic string, handler func(Event) error) error
}

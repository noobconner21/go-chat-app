package models

import "time"

// Message represents a chat message.
type Message struct {
    Sender    string    `json:"sender"`
    Content   string    `json:"content"`
    Timestamp time.Time `json:"timestamp"`
}
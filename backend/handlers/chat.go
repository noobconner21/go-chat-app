package handlers

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	Sender    string `json:"sender"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

var clients = make(map[*websocket.Conn]bool)

func HandleChat(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "Could not upgrade connection", http.StatusBadRequest)
		return
	}
	defer conn.Close()

	clients[conn] = true

	for {
		var msg Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			delete(clients, conn)
			break
		}

		broadcastMessage(msg)
	}
}

func broadcastMessage(msg Message) {
	for client := range clients {
		err := client.WriteJSON(msg)
		if err != nil {
			client.Close()
			delete(clients, client)
		}
	}
}

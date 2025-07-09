package main

import (
	"log"
	"net/http"

	"realtime-chat-app/handlers"
	"realtime-chat-app/models"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func main() {

	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("../frontend"))))

	// WebSocket endpoint
	http.HandleFunc("/ws", handlers.HandleChat)

	log.Println("Server started on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func HandleChat(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error while upgrading connection:", err)
		return
	}
	defer conn.Close()

	for {
		var msg models.Message
		err := conn.ReadJSON(&msg)
		if err != nil {
			log.Println("Error while reading message:", err)
			break
		}
	}
}

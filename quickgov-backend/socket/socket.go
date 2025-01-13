package socket

import (
	"encoding/json"
	"sync"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/websocket/v2"
	"github.com/google/uuid"
)

var SocketHub = *NewHub()

type Client struct {
	UserID uuid.UUID
	Conn   *websocket.Conn
}

type Hub struct {
	clients    map[*websocket.Conn]*Client
	clientsMux sync.RWMutex
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[*websocket.Conn]*Client),
	}
}

func (h *Hub) Register(userID uuid.UUID, conn *websocket.Conn) {
	h.clientsMux.Lock()
	defer h.clientsMux.Unlock()
	h.clients[conn] = &Client{
		UserID: userID,
		Conn:   conn,
	}
}

func (h *Hub) Unregister(conn *websocket.Conn) {
	h.clientsMux.Lock()
	defer h.clientsMux.Unlock()
	delete(h.clients, conn)
}

func (h *Hub) SendToUser(userID uuid.UUID, message []byte) {
	h.clientsMux.RLock()
	defer h.clientsMux.RUnlock()

	for _, client := range h.clients {
		if client.UserID == userID {
			msg := fiber.Map{"message": string(message)}
			jsonMessage, _ := json.Marshal(msg)
			client.Conn.WriteMessage(websocket.TextMessage, jsonMessage)
		}
	}
}

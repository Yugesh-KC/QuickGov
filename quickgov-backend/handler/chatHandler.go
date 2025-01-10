package handler

import (
	"quickgov-backend/database"
	"quickgov-backend/model"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

func AddMessage(c *fiber.Ctx) error {
	db := database.DB.Db

	var requestBody struct {
		SessionID string `json:"session_id"`
		Sender    string `json:"sender"`
		Message   string `json:"message"`
	}

	err := c.BodyParser(&requestBody)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	sessionUUID, err := uuid.Parse(requestBody.SessionID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid session ID format", "data": err.Error()})
	}

	newMessage := model.Chat{
		SessionID: sessionUUID,
		Sender:    requestBody.Sender,
		Message:   requestBody.Message,
	}

	if err = db.Create(&newMessage).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not add message", "data": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Message added", "data": newMessage})
}

func FetchAllChats(c *fiber.Ctx) error {
	db := database.DB.Db
	sessionID := c.Params("session_id")

	var messages []model.Chat
	if err := db.Where("session_id = ?", sessionID).Find(&messages).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not fetch messages", "data": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "data": messages})
}

package handler

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	// "github.com/google/uuid"
	"quickgov-backend/database"
	"quickgov-backend/model"
)

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func CreateSession(c *fiber.Ctx) error {
	db := database.DB.Db
	var requestBody struct {
		FirstMessage string `json:"first_message"`
	}
	err := c.BodyParser(&requestBody)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}
	titleWords := strings.Fields(requestBody.FirstMessage)
	title := strings.Join(titleWords[:min(len(titleWords), 20)], " ")

	newSession := model.Session{
		Title: title,
	}
	if err = db.Create(&newSession).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not create session", "data": err.Error()})
	}
	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "Session created", "data": newSession})
}

func FetchAllSessions(c *fiber.Ctx) error {
	db := database.DB.Db

	var sessions []model.Session
	if err := db.Find(&sessions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not fetch sessions", "data": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "data": sessions})
}

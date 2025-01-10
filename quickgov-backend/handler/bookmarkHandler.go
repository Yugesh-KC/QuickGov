package handler

import (
	"quickgov-backend/database"
	"quickgov-backend/model"

	"github.com/gofiber/fiber/v2"
)

func GetBookmarks(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	var bookmarks []model.Bookmark
	if err := database.DB.Db.Where("user_id = ?", userID).Find(&bookmarks).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not retrieve bookmarks", "data": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "data": bookmarks})
}

func UpdateBookmarkTopics(c *fiber.Ctx) error {
	db := database.DB.Db
	userID := c.Params("user_id")

	var requestBody struct {
		Topics []string `json:"topics"`
	}

	err := c.BodyParser(&requestBody)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	var bookmark model.Bookmark
	if err = db.Where("user_id = ?", userID).First(&bookmark).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Bookmark not found", "data": err.Error()})
	}

	existingTopicsMap := make(map[string]struct{})
	for _, topic := range bookmark.Topics {
		existingTopicsMap[topic] = struct{}{}
	}

	for _, newTopic := range requestBody.Topics {
		if _, exists := existingTopicsMap[newTopic]; !exists {
			bookmark.Topics = append(bookmark.Topics, newTopic)
		}
	}

	if err = db.Save(&bookmark).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not update bookmark", "data": err.Error()})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "Bookmark topics updated", "data": bookmark})
}

package handler

import (
	"quickgov-backend/database"
	"quickgov-backend/model"
	"strings"

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

func GetBookmarkedArticles(c *fiber.Ctx) error {
	db := database.DB.Db
	userID := c.Params("user_id")

	var bookmarks []model.Bookmark
	if err := db.Where("user_id = ?", userID).Find(&bookmarks).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to fetch bookmarks", "data": err.Error()})
	}

	response := make([]fiber.Map, 0)

	for _, bookmark := range bookmarks {
		var articles []model.Article

		if len(bookmark.Articles) > 0 {
			if err := db.Where("id = ANY(?)", bookmark.Articles).Find(&articles).Error; err != nil {
				return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Failed to fetch related articles", "data": err.Error()})
			}
		}

		for _, topic := range bookmark.Topics {
			filteredArticles := make([]model.Article, 0)
			for _, article := range articles {
				if containsTopic(article, topic) {
					filteredArticles = append(filteredArticles, article)
				}
			}

			response = append(response, fiber.Map{
				"topic":    topic,
				"articles": filteredArticles,
			})
		}
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "data": response})
}

func containsTopic(article model.Article, topic string) bool {
	return strings.Contains(article.Title, topic) || strings.Contains(article.Article, topic)

}

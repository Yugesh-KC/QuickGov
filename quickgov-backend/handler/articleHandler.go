package handler

import (
	"quickgov-backend/database"
	"quickgov-backend/model"

	"github.com/gofiber/fiber/v2"
)

func GetAllArticles(c *fiber.Ctx) error {
	db := database.DB.Db
	var articles []model.Article

	db.Find(&articles)
	if len(articles) == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Articles not found", "data": nil})
	}
	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "Articles found", "data": articles})
}

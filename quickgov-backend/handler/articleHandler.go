package handler

import (
	"fmt"
	"quickgov-backend/database"
	"quickgov-backend/model"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
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

func SaveScraped(date string, title string, location string, ministry string) {
	db := database.DB.Db

	var existingArticle model.Article
	if err := db.Where("date = ?", date).First(&existingArticle).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			newArticle := model.Article{
				Date:     date,
				Title:    title,
				Location: location,
				Ministry: ministry,
			}

			if err := db.Create(&newArticle).Error; err != nil {
				fmt.Println("Error saving article to database:", err)
			} else {
				fmt.Printf("Saved article to database: %s\n", title)
			}
		} else {
			fmt.Println("Error checking for existing article:", err)
		}
	} else {
		fmt.Printf("Article with date %s already exists in the database: %s\n", date, existingArticle.Title)
	}
}

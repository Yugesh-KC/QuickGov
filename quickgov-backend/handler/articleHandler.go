package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"quickgov-backend/database"
	"quickgov-backend/model"
	"strings"

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

func SummarizeArticles(c *fiber.Ctx) error {
	db := database.DB.Db
	var articles []model.Article

	if err := db.Find(&articles).Error; err != nil {
		return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to fetch articles", "data": err.Error()})
	}

	apiKey := "AIzaSyC-JOfG2Oc3CppcZVC3FxwbEXzSm9y1Zgs"
	for _, article := range articles {

		if article.Article == "" && !strings.HasSuffix(article.Location, ".pdf") {
			fileName := article.Location
			maxLengthOfWords := 60
			var errors []string
			// Prepare form data
			formData := new(bytes.Buffer)
			writer := multipart.NewWriter(formData)
			sFileName := fmt.Sprintf("quickgov-backend/%s", fileName)
			writer.WriteField("file_name", sFileName)
			writer.WriteField("api_key", apiKey)
			writer.WriteField("max_length_of_words", fmt.Sprintf("%d", maxLengthOfWords))

			err := writer.Close()
			if err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to prepare request body", "data": err.Error()})
			}

			resp, err := http.Post("http://localhost:8989/image-to-summary/", writer.FormDataContentType(), formData)
			if err != nil {
				errors = append(errors, fmt.Sprintf("Failed to call summarization service for article ID %s: %s", article.ID, err.Error()))
				continue // Skip to the next article
			}
			defer resp.Body.Close()

			if resp.StatusCode != http.StatusOK {
				var errorResponse map[string]interface{}
				json.NewDecoder(resp.Body).Decode(&errorResponse)

				return c.Status(resp.StatusCode).JSON(fiber.Map{
					"status":  "error",
					"message": fmt.Sprintf("Summarization service returned an error: %s", errorResponse["error"]),
				})
			}

			var summaryResponse struct {
				Title   string `json:"title"`
				Summary string `json:"summary"`
			}
			if err := json.NewDecoder(resp.Body).Decode(&summaryResponse); err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to decode response", "data": err.Error()})
			}

			article.Title = summaryResponse.Title
			article.Article = summaryResponse.Summary

			if err := db.Save(&article).Error; err != nil {
				return c.Status(http.StatusInternalServerError).JSON(fiber.Map{"status": "error", "message": "Failed to update article in database", "data": err.Error()})
			}
		}
	}

	return c.Status(http.StatusOK).JSON(fiber.Map{"status": "success", "message": "Articles summarized successfully"})
}

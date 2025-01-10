package router

import (
	"quickgov-backend/handler"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	ul := api.Group("/user")
	bl := api.Group("/bookmark")
	al := api.Group("/article")

	ul.Get("/", handler.GetAllUsers)
	ul.Get("/:id", handler.GetSingleUser)
	ul.Post("/", handler.CreateUser)

	bl.Get("/:user_id", handler.GetBookmarks)
	bl.Patch("/:user_id", handler.UpdateBookmarkTopics)

	al.Get("/", handler.GetAllArticles)
	// ul.Put("/:id")
	// ul.Delete("/:id")

}

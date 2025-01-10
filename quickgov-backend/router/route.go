package router

import (
	"quickgov-backend/handler"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	ul := api.Group("/user")

	ul.Get("/", handler.GetAllUsers)
	ul.Get("/:id", handler.GetSingleUser)
	ul.Post("/", handler.CreateUser)
	// ul.Put("/:id")
	// ul.Delete("/:id")

}

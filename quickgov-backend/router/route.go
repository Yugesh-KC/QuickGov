package router

import (
	"quickgov-backend/handler"
	"quickgov-backend/scraper"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	ul := api.Group("/user")
	bl := api.Group("/bookmark")
	al := api.Group("/article")
	cl := api.Group("/chat")
	sl := api.Group("/session")

	api.Get("/scrape", func(c *fiber.Ctx) error {
		go scraper.RunScraper()
		return c.SendString("Scraping started!")
	})

	ul.Get("/", handler.GetAllUsers)
	ul.Get("/:id", handler.GetSingleUser)
	ul.Post("/", handler.CreateUser)

	bl.Get("/:user_id", handler.GetBookmarks)
	bl.Patch("/:user_id", handler.UpdateBookmarkTopics)

	al.Get("/", handler.GetAllArticles)

	cl.Post("/", handler.AddMessage)
	cl.Get("/:session_id", handler.FetchAllChats)

	sl.Post("/", handler.CreateSession)
	sl.Get("/", handler.FetchAllSessions)
	// ul.Put("/:id")
	// ul.Delete("/:id")

}

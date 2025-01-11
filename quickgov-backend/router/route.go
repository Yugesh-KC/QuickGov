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
		go scraper.RunScraperMOHA()
		go scraper.RunScraperMOHP()
		return c.SendString("Both scrapers started!")
	})
	api.Post("/summarize", handler.SummarizeArticles)

	// ul.Get("/", handler.GetAllUsers)
	ul.Post("/", handler.GetSingleUser)
	ul.Post("/create/", handler.CreateUser)

	bl.Get("/:user_id", handler.GetBookmarks)
	bl.Patch("/:user_id", handler.UpdateBookmarkTopics)
	bl.Get("/:user_id/articles", handler.GetBookmarkedArticles)

	al.Get("/", handler.GetAllArticles)
	al.Get("/:ministry", handler.GetArticlesByMinistry)

	cl.Post("/", handler.AddMessage)
	cl.Get("/:session_id", handler.FetchAllChats)

	sl.Post("/", handler.CreateSession)
	sl.Get("/", handler.FetchAllSessions)
	// ul.Put("/:id")
	// ul.Delete("/:id")

}

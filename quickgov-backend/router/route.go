package router

import (
	"quickgov-backend/handler"
	"quickgov-backend/middleware"
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

	ul.Post("/create/", handler.CreateUser)
	ul.Post("/login", handler.Login)
	ul.Get("/id", middleware.AuthMiddleware(), handler.GetSingleUser)

	al.Get("/", handler.GetAllArticles)
	al.Get("/:ministry", handler.GetArticlesByMinistry)

	cl.Post("/", handler.AddMessage)
	cl.Get("/:session_id", handler.FetchAllChats)

	sl.Post("/", handler.CreateSession)
	sl.Get("/", handler.FetchAllSessions)

	bl.Get("/:user_id", handler.GetBookmarks)
	pBl := bl.Group("")
	pBl.Use(middleware.AuthMiddleware())
	pBl.Patch("/:user_id", handler.UpdateBookmarkTopics)
	pBl.Get("/:user_id/articles", handler.GetBookmarkedArticles)
}

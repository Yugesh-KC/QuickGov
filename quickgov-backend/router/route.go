package router

import (
	"quickgov-backend/handler"
	"quickgov-backend/middleware"
	"quickgov-backend/scraper"
	"quickgov-backend/socket"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"github.com/gofiber/websocket/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")
	ul := api.Group("/user")
	pBl := api.Group("/bookmark")
	al := api.Group("/article")
	cl := api.Group("/chat")
	sl := api.Group("/session")

	api.Get("/scrape", func(c *fiber.Ctx) error {
		go scraper.RunScraperMOHA()
		go scraper.RunScraperMOHP()
		return c.SendString("Both scrapers started!")
	})
	api.Post("/summarize", handler.SummarizeArticles)

	api.Use("/ws", func(c *fiber.Ctx) error {
		// Enable WebSocket upgrade
		if websocket.IsWebSocketUpgrade(c) {
			c.Locals("allowed", true)
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	api.Get("/ws", middleware.SocketAuthMiddleware(), websocket.New(func(c *websocket.Conn) {
		claims, ok := c.Locals("claims").(*middleware.Claims)
		if !ok {
			log.Infof("Failed to get claims from context")
			return
		}

		userId := claims.ID
		log.Infof("New WebSocket connection for user: %s", userId)

		socket.SocketHub.Register(userId, c)
		defer socket.SocketHub.Unregister(c)

		c.WriteJSON(fiber.Map{
			"type":   "connected",
			"userId": userId,
		})

		// ticker := time.NewTicker(3 * time.Second)
		// defer ticker.Stop()

		// go func() {
		// 	for {
		// 		select {
		// 		case <-ticker.C:
		// 			// Send a periodic message
		// 			message := []byte("Hello! This is a periodic message.")
		// 			socket.SocketHub.SendToUser(claims.ID, message)
		// 		}
		// 	}
		// }()

		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Infof("WebSocket error: %v", err)
				break
			}
			log.Infof("Received message from user %s: %s", userId, msg)
		}
	}))

	ul.Post("/create/", handler.CreateUser)
	ul.Post("/login", handler.Login)
	ul.Get("/id", middleware.AuthMiddleware(), handler.GetSingleUser)

	al.Get("/", handler.GetAllArticles)
	al.Get("/:ministry", handler.GetArticlesByMinistry)

	cl.Post("/", handler.AddMessage)
	cl.Get("/:session_id", handler.FetchAllChats)

	sl.Post("/", handler.CreateSession)
	sl.Get("/", handler.FetchAllSessions)

	// bl.Get("/:user_id", handler.GetBookmarks)

	// pBl := bl.Group("")
	pBl.Use(middleware.AuthMiddleware())
	pBl.Get("/", handler.GetBookmarks)
	pBl.Patch("/", handler.UpdateBookmarkTopics)
	pBl.Get("/articles", handler.GetBookmarkedArticles)

}

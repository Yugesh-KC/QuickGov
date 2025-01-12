package handler

import (
	"log"
	"quickgov-backend/database"
	"quickgov-backend/middleware"
	"quickgov-backend/model"

	// "strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"golang.org/x/crypto/bcrypt"
)

func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func CreateUser(c *fiber.Ctx) error {
	db := database.DB.Db
	user := new(model.User)

	err := c.BodyParser(user)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid input", "data": err.Error()})
	}

	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Error hashing password", "data": err.Error()})
	}
	user.Password = hashedPassword

	if err = db.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not create user", "data": err.Error()})
	}
	bookmarks := model.Bookmark{
		UserID:   user.ID,
		Topics:   model.StringArray{},
		Articles: model.StringArray{},
	}

	if err = db.Create(&bookmarks).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Could not create bookmark", "data": err.Error()})
	}

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "User has been created", "data": user})
}

func GetSingleUser(c *fiber.Ctx) error {
	claims, ok := c.Locals("claims").(*middleware.Claims)
	if !ok {
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Internal Server Error", "data": nil})
	}
	log.Println("Verified claims:", claims)
	var req struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"status": "error", "message": "Invalid request", "data": nil})
	}
	db := database.DB.Db
	var user model.User
	result := db.Where("email = ?", req.Email).First(&user)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User not found", "data": nil})
		}
		return c.Status(500).JSON(fiber.Map{"status": "error", "message": "Database error", "data": nil})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "User found", "data": user})
}

// func GetAllUsers(c *fiber.Ctx) error {
// 	db := database.DB.Db
// 	var users []model.User

// 	//db.Raw("SELECT * FROM Users").Scan(&users)
// 	db.Find(&users)

// 	if len(users) == 0 {
// 		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Users not found", "data": nil})
// 	}

// 	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "Users found", "data": users})
// }

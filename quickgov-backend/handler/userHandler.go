package handler

import (
	"quickgov-backend/database"
	"quickgov-backend/model"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
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

	return c.Status(201).JSON(fiber.Map{"status": "success", "message": "User has been created", "data": user})
}

func GetSingleUser(c *fiber.Ctx) error {
	db := database.DB.Db
	var user model.User
	id := c.Params("id")
	db.Find(&user, "id = ?", id)

	if user.ID == uuid.Nil {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "User not found", "data": nil})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "Users found", "data": user})
}

func GetAllUsers(c *fiber.Ctx) error {
	db := database.DB.Db
	var users []model.User

	//db.Raw("SELECT * FROM Users").Scan(&users)
	db.Find(&users)

	if len(users) == 0 {
		return c.Status(404).JSON(fiber.Map{"status": "error", "message": "Users not found", "data": nil})
	}

	return c.Status(200).JSON(fiber.Map{"status": "success", "message": "Users found", "data": users})
}

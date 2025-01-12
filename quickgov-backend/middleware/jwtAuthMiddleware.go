package middleware

import (
	"quickgov-backend/config"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

func AuthMiddleware() fiber.Handler {
	jwtKey := config.Config("JWT_SECRET")
	return func(c *fiber.Ctx) error {
		tokenString := c.Get("Authorization")
		if tokenString == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Unauthorized", "data": nil})
		}

		tokenString = strings.TrimPrefix(tokenString, "Bearer ")

		claims := &Claims{}
		tkn, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtKey), nil
		})

		if err != nil || !tkn.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"status": "error", "message": "Invalid token", "data": err.Error()})
		}

		// Store the claims in the context
		c.Locals("claims", claims)

		return c.Next()
	}
}

// func VerifyToken(tokenString string) (*Claims, error) {
// 	jwtKey := config.Config("JWT_SECRET")
// 	claims := &Claims{}
// 	tkn, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
// 		return jwtKey, nil
// 	})
// 	if err != nil {
// 		return nil, err
// 	}
// 	if !tkn.Valid {
// 		return nil, errors.New("invalid token")
// 	}
// 	return claims, nil
// }

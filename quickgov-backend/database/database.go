package database

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"quickgov-backend/config"

	"quickgov-backend/model"
)

type Dbinstance struct {
	Db *gorm.DB
}

var DB Dbinstance

func Connect() {
	p := config.Config("DB_PORT")

	port, err := strconv.ParseUint(p, 10, 32)
	if err != nil {
		fmt.Println("Error parsing str to int:", err)
		return
	}

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%d sslmode=disable TimeZone=Asia/Shanghai",
		config.Config("DB_HOST"),
		config.Config("DB_USER"),
		config.Config("DB_PASSWORD"),
		config.Config("DB_NAME"),
		port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		log.Fatal("Failed to connect to database:\n", err)
		os.Exit(2)
	}

	log.Println("Connected to the database")
	db.Logger = logger.Default.LogMode(logger.Info)

	log.Println("Running migrations")
	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatal("Failed to run migrations:\n", err)
	}

	DB = Dbinstance{
		Db: db,
	}
}

package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	ID       uuid.UUID `gorm:"type:uuid;primaryKey"`
	Name     string    `json:"name"`
	Email    string    `gorm:"unique" json:"email"`
	Password string    `json:"password"`
}

type Users struct {
	Users []User `json:"users"`
}

func (user *User) BeforeCreate(tx *gorm.DB) (err error) {

	user.ID = uuid.New()
	return
}

package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Session struct {
	gorm.Model
	ID    uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	Title string    `json:"title"`
}

type Sessions struct {
	Sessions []Session `json:"sessions"`
}

func (session *Session) BeforeCreate(tx *gorm.DB) (err error) {
	session.ID = uuid.New()
	return
}

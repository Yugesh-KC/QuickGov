package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Chat struct {
	gorm.Model
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	SessionID uuid.UUID `gorm:"type:uuid;not null" json:"session_id"`
	Sender    string    `json:"sender"`
	Message   string    `json:"message"`
}

type Chats struct {
	Chats []Chat `json:"chats"`
}

func (chat *Chat) BeforeCreate(tx *gorm.DB) (err error) {
	chat.ID = uuid.New()
	return
}

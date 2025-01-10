package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Article struct {
	gorm.Model
	ID       uuid.UUID `gorm:"type:uuid;primaryKey"`
	Date     string    `json:"date"`
	Title    string    `json:"title"`
	Location string    `json:"location"`
	Article  string    `json:"article"`
	Ministry string    `gorm:"size:10;not null" json:"ministry"`
}

type Articles struct {
	Articles []Article `json:"articles"`
}

func (article *Article) BeforeCreate(tx *gorm.DB) (err error) {
	article.ID = uuid.New()
	return
}

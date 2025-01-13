package model

import (
	"database/sql/driver"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Bookmark struct {
	ID        uuid.UUID   `gorm:"type:uuid;primaryKey;default:uuid_generate_v4()"`
	UserID    uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	Topics    StringArray `gorm:"type:text[]" json:"topics"`
	Articles  StringArray `gorm:"type:text[]" json:"articles"`
	CreatedAt time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}

type Bookmarks struct {
	Bookmarks []Bookmark `json:"bookmarks"`
}

func (bookmark *Bookmark) BeforeCreate(tx *gorm.DB) (err error) {
	bookmark.ID = uuid.New()
	return
}

type StringArray []string

func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = StringArray{}
		return nil
	}
	// Expecting a string in the format {"item1", "item2"}
	str, ok := value.(string)
	if !ok {
		return errors.New("failed to scan StringArray")
	}
	// Remove the curly braces and split by comma
	str = str[1 : len(str)-1] // Remove '{' and '}'
	items := strings.Split(str, ",")

	// Trim whitespace and quotes from each item
	var result []string
	for _, item := range items {
		item = strings.TrimSpace(item)
		item = strings.Trim(item, "\"") // Remove quotes
		result = append(result, item)
	}
	*a = StringArray(result)
	return nil
}

func (a StringArray) Value() (driver.Value, error) {
	// Format as PostgreSQL array literal
	if len(a) == 0 {
		return "{}", nil // Return an empty array without type casting
	}
	// Create a string representation of the array
	var formattedArray string
	formattedArray = "{"
	for i, v := range a {
		formattedArray += "\"" + v + "\""
		if i < len(a)-1 {
			formattedArray += ","
		}
	}
	formattedArray += "}"
	return formattedArray, nil
}

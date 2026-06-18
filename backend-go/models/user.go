package models

type User struct {

	ID uint `gorm:"primaryKey;autoIncrement" json:"id"`

	Name string `json:"name"`

	Email string `gorm:"unique" json:"email"`

	Phone string `json:"phone"`

	Password string `json:"-"`

	RoleID uint `json:"role_id"`

	IsActive bool `json:"is_active"`
}
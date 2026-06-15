package requests

type CreateCustomerRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Phone    string `json:"phone"`
	Password string `json:"password"`
	IsActive bool   `json:"is_active"`
}
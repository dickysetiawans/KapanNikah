package requests

type UpdateCustomerRequest struct {
    Name     string `json:"name"`
    Phone    string `json:"phone"`
	Email    string `json:"email"`
    IsActive bool   `json:"is_active"`
}
package middleware

import "github.com/gin-gonic/gin"

func Permission(permission string) gin.HandlerFunc {

	return func(c *gin.Context) {

		/*
			Nanti:
			ambil user dari JWT
			cek role
			cek role_permissions
			cek permission
		*/

		c.Next()
	}
}
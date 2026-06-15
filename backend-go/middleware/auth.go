package middleware

import (
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"fmt"
)

func Auth() gin.HandlerFunc {

	return func(c *gin.Context) {
	fmt.Println("===== AUTH START =====")
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {

			c.JSON(401, gin.H{
				"message": "Unauthorized",
			})

			c.Abort()
			return
		}

		tokenString := strings.Replace(
			authHeader,
			"Bearer ",
			"",
			1,
		)

		token, err := jwt.Parse(
			tokenString,
			func(token *jwt.Token) (interface{}, error) {

				return []byte(
					os.Getenv("JWT_SECRET"),
				), nil
			},
		)

		if err != nil || !token.Valid {

			c.JSON(401, gin.H{
				"message": "Invalid Token",
			})

			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)

		if !ok {

			c.JSON(401, gin.H{
				"message": "Invalid Claims",
			})

			c.Abort()
			return
		}

		// Simpan ke context
		c.Set(
			"userId",
			claims["id"],
		)

		c.Next()
	}
}
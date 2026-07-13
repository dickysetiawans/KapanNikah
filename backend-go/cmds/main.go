package main

import (
	"wedding-backend/config"
	"wedding-backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {

	config.ConnectDB()

	r := gin.Default()
	r.MaxMultipartMemory = 20 << 20 
	routes.SetupRoutes(r)

	r.Run(":8080")
}
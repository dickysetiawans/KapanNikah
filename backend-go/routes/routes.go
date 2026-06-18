package routes

import (
	"time"
	"wedding-backend/controllers"
	"wedding-backend/middleware"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
)


func SetupRoutes(r *gin.Engine) {
	
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent) // Status 204
			return
		}

		c.Next()
	})
	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  5,
	}
	store := memory.NewStore()
	limiterMiddleware := mgin.NewMiddleware(limiter.New(store, rate))

	api := r.Group("/api")
	{
		
		api.POST("/auth/login", limiterMiddleware, controllers.Login)
	}

	
	protected := api.Group("/")
	protected.Use(middleware.Auth()) 
	{
		protected.GET("/users", controllers.GetUsers)
		protected.GET("/me", controllers.Me)
		
		protected.GET("/paket", controllers.GetPaket)
		protected.POST("/paket", limiterMiddleware, controllers.CreatePaket)
		protected.GET("/paket/:id", controllers.GetPaketByID)
		protected.PUT("/paket/:id", limiterMiddleware, controllers.UpdatePaket)
		protected.DELETE("/paket/:id", limiterMiddleware, controllers.DeletePaket)

		
		protected.GET("/customers", controllers.GetCustomer)
		protected.POST("/customers", skipOptionsLimiter, controllers.CreateCustomer)
		protected.GET("/customers/:id", controllers.GetCustomerByID)
		protected.PUT("/customers/:id",skipOptionsLimiter, controllers.UpdateCustomer)
		protected.POST("/customers/sendMessage/:id", skipOptionsLimiter, controllers.SendPasswordToEmailCustomer)


		protected.GET("/admins", controllers.GetAdmin)
		protected.POST("/admin", skipOptionsLimiter, controllers.CreateAdmin)
		protected.GET("/admin/:id", controllers.GetAdminByID)
		protected.PUT("/admin/:id",skipOptionsLimiter, controllers.UpdateAdmin)
	}
}
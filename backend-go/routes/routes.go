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
	// 1. Setup CORS (Biar React bisa akses)
	r.Use(cors.New(cors.Config{
		AllowOrigins: []string{"http://localhost:5173"},
		AllowMethods: []string{"POST", "GET", "OPTIONS", "PUT"},
		AllowHeaders: []string{"Content-Type", "Authorization"},
	}))

	// 2. Setup Rate Limiter (Contoh: Maksimal 5 request per menit berdasarkan IP)
	rate := limiter.Rate{
		Period: 1 * time.Minute,
		Limit:  5,
	}
	store := memory.NewStore()
	limiterMiddleware := mgin.NewMiddleware(limiter.New(store, rate))

	api := r.Group("/api")
	{
		// Pasang limiterMiddleware KHUSUS di rute login agar tidak di-brute force oleh bot
		api.POST("/auth/login", limiterMiddleware, controllers.Login)
	}

	protected := api.Group("/")
	protected.Use(middleware.Auth())
	{
		protected.GET("/users", controllers.GetUsers)
		protected.GET("/me", controllers.Me)
		protected.GET("/customers", controllers.GetCustomer)
		protected.POST("/customers", limiterMiddleware, controllers.CreateCustomer)
		protected.GET("/customers/:id", controllers.GetCustomerByID)
		protected.PUT("/customers/:id",limiterMiddleware, controllers.UpdateCustomer)
		protected.POST("/customers/sendMessage/:id", limiterMiddleware, controllers.SendPasswordToEmailCustomer)


		protected.GET("/admins", controllers.GetAdmin)
		protected.POST("/admin", limiterMiddleware, controllers.CreateAdmin)
		protected.GET("/admin/:id", controllers.GetAdminByID)
		protected.PUT("/admin/:id",limiterMiddleware, controllers.UpdateAdmin)
	}
}
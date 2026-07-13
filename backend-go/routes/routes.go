package routes

import (
	"time"
	"wedding-backend/controllers"
	"wedding-backend/middleware"

	// "github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/ulule/limiter/v3"
	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	"github.com/ulule/limiter/v3/drivers/store/memory"
	"net/http"
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
	r.Static("/uploads", "./uploads")
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
		protected.GET("/paket/:id/detail-fitur", controllers.GetDetailFiturByPaketID)
		protected.GET("/paket/:id/detail-template", controllers.GetDetailTemplateByPaketID)


		protected.GET("/customers", controllers.GetCustomer)
		protected.POST("/customers", limiterMiddleware, controllers.CreateCustomer)
		protected.GET("/customers/:id", controllers.GetCustomerByID)
		protected.PUT("/customers/:id",limiterMiddleware, controllers.UpdateCustomer)
		protected.POST("/customers/sendMessage/:id", limiterMiddleware, controllers.SendPasswordToEmailCustomer)
		protected.GET("/customers/active", controllers.GetCustomerActive)


		protected.GET("/admins", controllers.GetAdmin)
		protected.POST("/admin", limiterMiddleware, controllers.CreateAdmin)
		protected.GET("/admin/:id", controllers.GetAdminByID)
		protected.PUT("/admin/:id",limiterMiddleware, controllers.UpdateAdmin)

		protected.GET("/kegiatan", controllers.GetKegiatan)
		protected.POST("/kegiatan", limiterMiddleware, controllers.CreateKegiatan)
		protected.GET("/kegiatan/:id", controllers.GetKegiatanByID)
		protected.PUT("/kegiatan/:id", limiterMiddleware, controllers.UpdateKegiatan)
		// protected.DELETE("/kegiatan/:id", limiterMiddleware, controllers.DeleteKegiatan)

		// Fitur
		protected.GET("/fitur", controllers.GetFitur)
		protected.POST("/fitur", limiterMiddleware, controllers.CreateFitur)
		protected.GET("/fitur/:id", controllers.GetFiturByID)
		protected.PUT("/fitur/:id", limiterMiddleware, controllers.UpdateFitur)
		protected.GET("/fitur/aktif", controllers.GetFiturByIDAndIsActive)
		protected.GET("/fitur/kegiatan/:id", controllers.GetFiturByKegiatanID)

		// Acara
		protected.GET("/acara", controllers.GetAcara)
		protected.POST("/acara", limiterMiddleware, controllers.CreateAcara)
		protected.GET("/acara/:id", controllers.GetAcaraByID)
		protected.POST("/acara/update/:id", limiterMiddleware, controllers.UpdateAcara)

		protected.GET("/paket/kegiatan/:id", controllers.GetPaketByKegiatanID)
		// protected.POST("/acara", limiterMiddleware, controllers.CreateAcara)
		// protected.GET("/acara/:id", controllers.GetAcaraByID)
		// protected.PUT("/acara/:id", limiterMiddleware, controllers.UpdateAcara)

		protected.POST("/acara/:id/galeri", limiterMiddleware, controllers.UploadGaleriFoto)
		protected.DELETE("/acara/:id/galeri/:galeriId", controllers.DeleteGaleriAcara)


	}
}
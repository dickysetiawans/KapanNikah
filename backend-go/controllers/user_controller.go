package controllers

import (
    "strings"
	"wedding-backend/config"
	"wedding-backend/models"
	"wedding-backend/requests"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"fmt"
 	"regexp"
	"wedding-backend/helpers"
)

func GetUsers(c *gin.Context) {

	var users []models.User

	config.DB.Find(&users)

	c.JSON(200, users)
}
// Di dalam user_controller.go (Sekitar baris 27)

func Me(c *gin.Context) {
    // 1. Ambil nilai dari c.Get yang sudah diset oleh middleware
    userIdCtx, exists := c.Get("userId") // Sesuaikan key "userId" dengan middleware Anda
	fmt.Printf("userIdCtx = %#v\n", userIdCtx)
	fmt.Printf("type = %T\n", userIdCtx)
    if !exists {
        c.JSON(401, gin.H{"message": "Unauthorized"})
        return
    }
	
    // 2. Lakukan type assertion ke float64 (karena JWT mapClaims membaca angka sebagai float64)
    userIdFloat, ok := userIdCtx.(float64)

    if !ok {
        c.JSON(400, gin.H{"message": "Invalid User ID type"})
        return
    }

    
    userID := int(userIdFloat)

    var user models.User
    if err := config.DB.Where("id = ?", userID).First(&user).Error; err != nil {
        c.JSON(404, gin.H{"message": "User tidak ditemukan"})
        return
    }

    c.JSON(200, user)
}

func GetCustomer(c *gin.Context) {

	var users []models.User

	err := config.DB.Where("role_id = ?", 2).Order("id desc").Find(&users).Error

	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed get customers",
		})
		return
	}

	c.JSON(200, users)
}
func CreateCustomer(c *gin.Context) {

	var req requests.CreateCustomerRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(400, gin.H{
			"message": "Request tidak valid",
		})

		return
	}

	// validasi wajib isi
	if strings.TrimSpace(req.Name) == "" {

		c.JSON(400, gin.H{
			"message": "Nama wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Email) == "" {

		c.JSON(400, gin.H{
			"message": "Email wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Phone) == "" {

		c.JSON(400, gin.H{
			"message": "Nomor HP wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Password) == "" {

		c.JSON(400, gin.H{
			"message": "Password wajib diisi",
		})

		return
	}
    // cek untuk number phone 

    phoneRegex := regexp.MustCompile(`^[0-9]{10,15}$`)

    if !phoneRegex.MatchString(req.Phone) {

        c.JSON(400, gin.H{
            "message": "Nomor HP harus 10-15 digit angka",
        })

        return
    }

	// cek email
	var emailCount int64

	config.DB.
		Model(&models.User{}).
		Where("email = ?", req.Email).
		Count(&emailCount)

	if emailCount > 0 {

		c.JSON(400, gin.H{
			"message": "Email sudah digunakan",
		})

		return
	}

	// cek phone
	var phoneCount int64

	config.DB.
		Model(&models.User{}).
		Where("phone = ?", req.Phone).
		Count(&phoneCount)

	if phoneCount > 0 {

		c.JSON(400, gin.H{
			"message": "Nomor HP sudah digunakan",
		})

		return
	}

	// simpan password asli untuk email
	// plainPassword := req.Password

	// hash password
	hashedPassword, err :=
		bcrypt.GenerateFromPassword(
			[]byte(req.Password),
			bcrypt.DefaultCost,
		)

	if err != nil {

		c.JSON(500, gin.H{
			"message": "Gagal hash password",
		})

		return
	}

	tx := config.DB.Begin()

	user := models.User{
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		Password:   string(hashedPassword),
		RoleID:     2, // customer
		IsActive:   req.IsActive,
	}

	if err := tx.Create(&user).Error; err != nil {

		tx.Rollback()

		c.JSON(500, gin.H{
			"message": "Gagal menyimpan user",
		})

		return
	}

	// Kirim Email
	err = helpers.SendCustomerEmail(
        user.Email,
        user.Name,
        req.Password, 
    )

    if err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{
            "message": "Gagal mengirim email kredensial, pendaftaran dibatalkan",
            "error":   err.Error(), // Bisa dihapus saat production demi keamanan
        })
        return
    }

	tx.Commit()

	c.JSON(200, gin.H{
		"message": "Customer berhasil dibuat",
	})
}

func GetCustomerByID(c *gin.Context) {
		// ini untuk get id nya
	id := c.Param("id")
		
	var user models.User

	err := config.DB.Where("id = ? AND role_id = ?", id, 2).First(&user).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Customer tidak ditemukan",
		})
		return
	}

	c.JSON(200, user)
}


func UpdateCustomer(c *gin.Context) {

    id := c.Param("id")

    var req requests.UpdateCustomerRequest

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{
            "message": "Request tidak valid",
        })
        return
    }

    if strings.TrimSpace(req.Name) == "" {
        c.JSON(400, gin.H{
            "message": "Nama wajib diisi",
        })
        return
    }

    if strings.TrimSpace(req.Phone) == "" {
        c.JSON(400, gin.H{
            "message": "Nomor HP wajib diisi",
        })
        return
    }
	if strings.TrimSpace(req.Email) == "" {

		c.JSON(400, gin.H{
			"message": "Email wajib diisi",
		})

		return
	}
	var emailCount int64

	config.DB.
			Model(&models.User{}).
			Where("email = ? AND id != ?", req.Email, id).
			Count(&emailCount)

	if emailCount > 0 {

		c.JSON(400, gin.H{
			"message": "Email sudah digunakan oleh pelanggan lain",
		})

		return
	}

    phoneRegex := regexp.MustCompile(`^[0-9]{10,15}$`)
    if !phoneRegex.MatchString(req.Phone) {
        c.JSON(400, gin.H{
            "message": "Nomor HP harus 10-15 digit angka",
        })
        return
    }

    
    var user models.User
    if err := config.DB.Where("id = ? AND role_id = ?", id, 2).First(&user).Error; err != nil {
        c.JSON(404, gin.H{
            "message": "Customer tidak ditemukan",
        })
        return
    }


    var phoneCount int64
    config.DB.
        Model(&models.User{}).
        Where("phone = ? AND id != ?", req.Phone, id). // 👈 Kunci utamanya di sini coo
        Count(&phoneCount)

    if phoneCount > 0 {
        c.JSON(400, gin.H{
            "message": "Nomor HP sudah digunakan oleh pelanggan lain",
        })
        return
    }

    // 6. Jalankan DB Transaction seperti fungsi Create kamu
    tx := config.DB.Begin()

    // Update field yang diizinkan untuk diubah
    user.Name = req.Name
    user.Phone = req.Phone
    user.IsActive = req.IsActive
	user.Email = req.Email
    // Simpan perubahan ke database
    if err := tx.Save(&user).Error; err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{
            "message": "Gagal memperbarui data customer",
        })
        return
    }

    tx.Commit()

    c.JSON(200, gin.H{
        "message": "Customer berhasil diperbarui",
    })
	
}
func SendPasswordToEmailCustomer(c *gin.Context) {
		// ini untuk get id nya
	id := c.Param("id")
		
	var user models.User

	err := config.DB.Where("id = ? AND role_id = ?", id, 2).First(&user).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Customer tidak ditemukan",
		})
		return
	}
	fmt.Printf("Mengirim email ke: '%s'\n", user.Email)
	err = helpers.SendCustomerEmail(
        user.Email,
        user.Name,
        user.Password, 
    )
	
    if err != nil {
        
        c.JSON(500, gin.H{
            "message": "Gagal mengirim email kredensial, pendaftaran dibatalkan",
            "error":   err.Error(), 
        })
        return
    }

	c.JSON(200, gin.H{
        "message": "Password Berhasil Dikirim",
    })
}


func GetAdmin(c *gin.Context) {
    userIdCtx, _ := c.Get("userId")
    userIdFloat, _ := userIdCtx.(float64)
    currentUserID := int(userIdFloat)

    var users []models.User

    err := config.DB.Where("role_id = ? AND id != ?", 1, currentUserID).Order("id desc").Find(&users).Error

    if err != nil {
        c.JSON(500, gin.H{"message": "Failed get Admin"})
        return
    }

    c.JSON(200, users)
}
func CreateAdmin(c *gin.Context) {

	var req requests.CreateCustomerRequest

	if err := c.ShouldBindJSON(&req); err != nil {

		c.JSON(400, gin.H{
			"message": "Request tidak valid",
		})

		return
	}

	// validasi wajib isi
	if strings.TrimSpace(req.Name) == "" {

		c.JSON(400, gin.H{
			"message": "Nama wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Email) == "" {

		c.JSON(400, gin.H{
			"message": "Email wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Phone) == "" {

		c.JSON(400, gin.H{
			"message": "Nomor HP wajib diisi",
		})

		return
	}

	if strings.TrimSpace(req.Password) == "" {

		c.JSON(400, gin.H{
			"message": "Password wajib diisi",
		})

		return
	}
    // cek untuk number phone 

    phoneRegex := regexp.MustCompile(`^[0-9]{10,15}$`)

    if !phoneRegex.MatchString(req.Phone) {

        c.JSON(400, gin.H{
            "message": "Nomor HP harus 10-15 digit angka",
        })

        return
    }

	// cek email
	var emailCount int64

	config.DB.
		Model(&models.User{}).
		Where("email = ?", req.Email).
		Count(&emailCount)

	if emailCount > 0 {

		c.JSON(400, gin.H{
			"message": "Email sudah digunakan",
		})

		return
	}

	// cek phone
	var phoneCount int64

	config.DB.
		Model(&models.User{}).
		Where("phone = ?", req.Phone).
		Count(&phoneCount)

	if phoneCount > 0 {

		c.JSON(400, gin.H{
			"message": "Nomor HP sudah digunakan",
		})

		return
	}

	// simpan password asli untuk email
	// plainPassword := req.Password

	// hash password
	hashedPassword, err :=
		bcrypt.GenerateFromPassword(
			[]byte(req.Password),
			bcrypt.DefaultCost,
		)

	if err != nil {

		c.JSON(500, gin.H{
			"message": "Gagal hash password",
		})

		return
	}

	tx := config.DB.Begin()

	user := models.User{
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		Password:   string(hashedPassword),
		RoleID:     1, // customer
		IsActive:   req.IsActive,
	}

	if err := tx.Create(&user).Error; err != nil {

		tx.Rollback()

		c.JSON(500, gin.H{
			"message": "Gagal menyimpan Admin",
		})

		return
	}

	// Kirim Email
	err = helpers.SendCustomerEmail(
        user.Email,
        user.Name,
        req.Password, 
    )

    if err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{
            "message": "Gagal mengirim email kredensial, pendaftaran dibatalkan",
            "error":   err.Error(), // Bisa dihapus saat production demi keamanan
        })
        return
    }

	tx.Commit()

	c.JSON(200, gin.H{
		"message": "Admin berhasil dibuat",
	})
}

func GetAdminByID(c *gin.Context) {
		// ini untuk get id nya
	id := c.Param("id")
		
	var user models.User

	err := config.DB.Where("id = ? AND role_id = ?", id, 1).First(&user).Error

	if err != nil {
		c.JSON(404, gin.H{
			"message": "Admin tidak ditemukan",
		})
		return
	}

	c.JSON(200, user)
}


func UpdateAdmin(c *gin.Context) {

    id := c.Param("id")

    var req requests.UpdateCustomerRequest

    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(400, gin.H{
            "message": "Request tidak valid",
        })
        return
    }

    if strings.TrimSpace(req.Name) == "" {
        c.JSON(400, gin.H{
            "message": "Nama wajib diisi",
        })
        return
    }

    if strings.TrimSpace(req.Phone) == "" {
        c.JSON(400, gin.H{
            "message": "Nomor HP wajib diisi",
        })
        return
    }
	if strings.TrimSpace(req.Email) == "" {

		c.JSON(400, gin.H{
			"message": "Email wajib diisi",
		})

		return
	}
	var emailCount int64

	config.DB.
			Model(&models.User{}).
			Where("email = ? AND id != ?", req.Email, id).
			Count(&emailCount)

	if emailCount > 0 {

		c.JSON(400, gin.H{
			"message": "Email sudah digunakan oleh pelanggan lain",
		})

		return
	}

    phoneRegex := regexp.MustCompile(`^[0-9]{10,15}$`)
    if !phoneRegex.MatchString(req.Phone) {
        c.JSON(400, gin.H{
            "message": "Nomor HP harus 10-15 digit angka",
        })
        return
    }

    
    var user models.User
    if err := config.DB.Where("id = ? AND role_id = ?", id, 1).First(&user).Error; err != nil {
        c.JSON(404, gin.H{
            "message": "Admin tidak ditemukan",
        })
        return
    }


    var phoneCount int64
    config.DB.
        Model(&models.User{}).
        Where("phone = ? AND id != ?", req.Phone, id). // 👈 Kunci utamanya di sini coo
        Count(&phoneCount)

    if phoneCount > 0 {
        c.JSON(400, gin.H{
            "message": "Nomor HP sudah digunakan oleh pelanggan lain",
        })
        return
    }

    // 6. Jalankan DB Transaction seperti fungsi Create kamu
    tx := config.DB.Begin()

    // Update field yang diizinkan untuk diubah
    user.Name = req.Name
    user.Phone = req.Phone
    user.IsActive = req.IsActive
	user.Email = req.Email
    // Simpan perubahan ke database
    if err := tx.Save(&user).Error; err != nil {
        tx.Rollback()
        c.JSON(500, gin.H{
            "message": "Gagal memperbarui data customer",
        })
        return
    }

    tx.Commit()

    c.JSON(200, gin.H{
        "message": "Admin berhasil diperbarui",
    })
	
}


func GetCustomerActive(c *gin.Context) {
	var users []models.User

	err := config.DB.Where("role_id = ? and is_active = ? ", 2, true).Order("id desc").Find(&users).Error

	if err != nil {
		c.JSON(500, gin.H{
			"message": "Failed get customers",
		})
		return
	}

	c.JSON(200, users)
}
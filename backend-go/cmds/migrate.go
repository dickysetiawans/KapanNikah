package main

import (
	"fmt"
	"log"
	"os"
	"strconv" // Tambahkan package ini untuk konversi string ke int

	"github.com/golang-migrate/migrate/v4"

	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"

	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal(".env not found")
	}

	dbURL := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=disable",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	m, err := migrate.New(
		"file://migrations",
		dbURL,
	)
	if err != nil {
		log.Fatal(err)
	}

	if len(os.Args) < 2 {
		log.Fatal("Usage: go run cmd/migrate.go [up|down|force]")
	}

	command := os.Args[1]

	switch command {
	case "up":
		if err := m.Up(); err != nil && err.Error() != "no change" {
			log.Fatal(err)
		}
		fmt.Println("Migration Success")

	case "down":
		if err := m.Steps(-1); err != nil {
			log.Fatal(err)
		}
		fmt.Println("Rollback Success")

	// === TAMBAHKAN CASE FORCE DI SINI ===
	case "force":
		if len(os.Args) < 3 {
			log.Fatal("Usage: go run cmd/migrate.go force [version_number]")
		}
		
		// Ambil argumen versi angka (misal: 6 atau 7)
		version, err := strconv.Atoi(os.Args[2])
		if err != nil {
			log.Fatal("Version must be a number")
		}

		if err := m.Force(version); err != nil {
			log.Fatal(err)
		}
		fmt.Printf("Force Version to %d Success\n", version)

	default:
		fmt.Println("Unknown Command")
	}
}
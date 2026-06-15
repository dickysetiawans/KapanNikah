\# Wedding Invitation



Aplikasi Wedding Invitation berbasis:



\* Frontend: React + Vite + TailAdmin

\* Backend: Golang (Gin Framework)

\* Database: PostgreSQL



\## Requirements



Pastikan sudah terinstall:



\### Frontend



\* Node.js >= 20

\* NPM >= 10



Cek versi:



```bash

node -v

npm -v

```



\### Backend



\* Go >= 1.24



Cek versi:



```bash

go version

```



\### Database



\* PostgreSQL >= 15



\---



\# Clone Project



```bash

git clone https://github.com/dickysetiawans/KapanNikah.git

cd wedding-invitation

```



\---



\# Backend Setup



Masuk ke folder backend:



```bash

cd backend-go

```



Install dependency:



```bash

go mod tidy

```



Buat file `.env`



```env

APP\_PORT=8080



DB\_HOST=localhost

DB\_PORT=5432

DB\_USER=postgres

DB\_PASSWORD=123456

DB\_NAME=wedding\_invitation



JWT\_SECRET=your-secret-key



SMTP\_HOST=smtp.gmail.com

SMTP\_PORT=587

SMTP\_USER=your-email@gmail.com

SMTP\_PASS=your-app-password

```



\## Database Migration



Jalankan migration:



```bash

go run cmd/migrate.go up

```



Rollback migration:



```bash

go run cmd/migrate.go down

```



Cek versi migration:



```bash

go run cmd/migrate.go version

```



\## Menjalankan Backend



```bash

go run main.go

```



Backend akan berjalan di:



```text

http://localhost:8080

```



\---



\# Frontend Setup



Masuk ke folder frontend:



```bash

cd frontend

```



Install dependency:



```bash

npm install

```



\## Menjalankan Frontend



```bash

npm run dev

```



Frontend akan berjalan di:



```text

http://localhost:5173

```



\## Build Production



```bash

npm run build

```



Hasil build:



```text

dist/

```



\---



\# Login Default



Administrator:



```text

Email    : admin@example.com

Password : admin123

```



Silakan sesuaikan dengan data yang tersedia di database.



\---



\# Features



\## Authentication



\* Login

\* Logout

\* JWT Authentication

\* Protected Route

\* Guest Route



\## User Management



\* List Customer

\* Create Customer

\* Active / Inactive Customer

\* Email Notification



\## Role Management



\* Role

\* Permission

\* Role Permission



\## Dashboard



\* Summary Data

\* Customer Statistics



\---



\# Project Structure



```text

backend-go/

├── config/

├── controllers/

├── middleware/

├── migrations/

├── models/

├── routes/

├── helpers/

├── main.go

└── .env



frontend/

├── src/

│   ├── components/

│   ├── pages/

│   ├── routes/

│   ├── context/

│   ├── layout/

│   └── App.tsx

└── vite.config.js

```



\---



\# Environment Variables



\## Backend



```env

APP\_PORT=

DB\_HOST=

DB\_PORT=

DB\_USER=

DB\_PASSWORD=

DB\_NAME=

JWT\_SECRET=



SMTP\_HOST=

SMTP\_PORT=

SMTP\_USER=

SMTP\_PASS=

```



\---



\# Notes



Untuk pengiriman email menggunakan Gmail:



1\. Aktifkan Two-Factor Authentication.

2\. Buat App Password.

3\. Gunakan App Password pada variabel:



```env

SMTP\_PASS=

```



Jangan menggunakan password Gmail biasa.



\---



\# License



MIT License




package helpers

import (
	"crypto/tls"
	"fmt"
	"net/smtp"
	"os"
)

func SendCustomerEmail(toEmail, name, plainPassword string) error {
    from := os.Getenv("SMTP_EMAIL")
    password := os.Getenv("SMTP_PASSWORD")
    smtpHost := os.Getenv("SMTP_HOST")
    smtpPort := os.Getenv("SMTP_PORT")

    if smtpPort == "" {
        smtpPort = "587"
    }
    if smtpHost == "" {
        smtpHost = "smtp.gmail.com"
    }

    client, err := smtp.Dial(smtpHost + ":" + smtpPort)
    if err != nil {
        return fmt.Errorf("gagal koneksi ke SMTP host: %v", err)
    }

    tlsConfig := &tls.Config{
        ServerName: smtpHost,
        MinVersion: tls.VersionTLS12,
    }

    if err := client.StartTLS(tlsConfig); err != nil {
        client.Close()
        return fmt.Errorf("gagal mengaktifkan STARTTLS: %v", err)
    }

    auth := smtp.PlainAuth("", from, password, smtpHost)
    if err := client.Auth(auth); err != nil {
        client.Close()
        return fmt.Errorf("gagal autentikasi SMTP: %v", err)
    }

    if err := client.Mail(from); err != nil {
        client.Close()
        return err
    }
    if err := client.Rcpt(toEmail); err != nil {
        client.Close()
        return err
    }

    w, err := client.Data()
    if err != nil {
        client.Close()
        return err
    }

    body := fmt.Sprintf(`
		<h3>Halo %s, Selamat Bergabung!</h3>
		<p>Email: %s</p>
		<p>Password: %s</p>
	`, name, toEmail, plainPassword)

    // ✅ Header lengkap dengan From, To, Subject
    message := fmt.Sprintf(
        "From: %s\r\nTo: %s\r\nSubject: Akun Pelanggan Baru Berhasil Dibuat!\r\nMIME-version: 1.0\r\nContent-Type: text/html; charset=\"UTF-8\"\r\n\r\n%s",
        from, toEmail, body,
    )

    if _, err = w.Write([]byte(message)); err != nil {
        w.Close()
        client.Close()
        return err
    }

    // ✅ Tutup writer dulu, baru quit
    if err := w.Close(); err != nil {
        client.Close()
        return err
    }

    return client.Quit()
}
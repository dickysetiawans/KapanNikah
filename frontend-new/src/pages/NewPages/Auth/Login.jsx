import { useState, useEffect } from "react";
import axios from "axios";
import "../../../assets/css/Login.css";
import { Mail, Lock } from 'lucide-react';
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ini untuk set title 
  useEffect(() => {
      document.title = "Login - KapanNikah";
      
      // (Opsional) Mengembalikan ke title semula saat user meninggalkan halaman login
      return () => {
        document.title = "KapanNikah - Wedding Invitation";
      };
    }, []);
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    }
  };

  return (
  <div class="login-container">
    <div class="brand-side">
            <div class="brand-overlay"></div>
            <div class="brand-content">
                <img 
                  src="/icon-kapannika-no-circle2.png" 
                  alt="Logo KapanNikah" 
                  className="brand-logo" 
                />
                <p>KapanNikah</p>
            </div>
        </div>
         <div class="form-side">
            <div class="form-container">
                <div class="form-header">
                    <h1>Selamat Datang</h1>
                    <p>Silakan masuk untuk mengelola undangan Anda</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div class="input-group">
                        <label for="email">Email</label>
                        <div class="input-wrapper">
                           <Mail className="input-icon" size={18} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                id="email"
                                required
                              />   
                        </div>
                    </div>

                    <div class="input-group">
                        <label for="password">Kata Sandi</label>
                        <div class="input-wrapper">
                            <Lock className="input-icon" size={18} />
                              <input
                                type="password"
                                placeholder="Kata Sandi"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                id="password"
                                required
                              />  
                          </div>
                    </div>

                    <div class="form-actions">
                        {/* <label class="remember-me">
                            <input type="checkbox"> Ingat saya
                        </label> */}
                        <a href="#" class="forgot-pass">Lupa kata sandi?</a>
                    </div>

                    <button type="submit" class="btn-login">Masuk</button>
                </form>
            </div>
        </div>
  </div>
);
}
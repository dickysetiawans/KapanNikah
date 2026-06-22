import { useState, useEffect } from "react";
import axios from "axios";
// import "../../assets/css/Login.css";
import { Mail, Lock } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Login gagal");
    }
  };

  useEffect(() => {
    document.body.style.minHeight = "100vh";
    document.body.style.display = "flex";
    document.body.style.alignItems = "center";
    document.body.style.justifyContent = "center";
    document.body.style.background =
      "linear-gradient(135deg, #e6f4ea 0%, #ceead6 100%)";

    return () => {
      document.body.removeAttribute("style");
    };
  }, []);

  return (
    <div className="login-container">
      <div className="brand-side">
        <div className="brand-overlay"></div>
        <div className="brand-content">
          <img 
            src="/icon-kapannika-no-circle2.png" 
            alt="Logo KapanNikah" 
            className="brand-logo" 
          />
          <p>KapanNikah</p>
        </div>
      </div>

      <div className="form-side">
        <div className="form-container">
          <div className="form-header">
            <h1>Selamat Datang</h1>
            <p>Silakan masuk untuk mengelola undangan Anda</p>
          </div>

          {/* Menambahkan autoComplete="off" di form */}
          <form onSubmit={handleLogin} autoComplete="off">
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  autoComplete="email" 
                  required
                />   
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Kata Sandi</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Kata Sandi"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                  autoComplete="new-password" 
                  required
                />  
              </div>
            </div>

            <div className="form-actions">
              <a href="#" className="forgot-pass">Lupa kata sandi?</a>
            </div>

            <button type="submit" className="btn-login">Masuk</button>
          </form>
        </div>
      </div>
    </div>
  );
}
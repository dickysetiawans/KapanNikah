import { useState } from "react";
import ComponentCard from "../../common/ComponentCard";
import Label from "../../form/Label";
import Input from "../../form/input/InputField";
import Select from "../../form/Select";
import { EyeCloseIcon, EyeIcon, TimeIcon } from "../../../icons";
import DatePicker from "../../form/date-picker.tsx";
import Switch from "../../form/switch/Switch";
import axios from "axios";
import { useNavigate } from "react-router";

export default function CustomerAddForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTwo, setEmailTwo] = useState("");
  const [error, setError] = useState(false);

  const handleSelectChange = (value: string) => {
    console.log("Selected value:", value);
  };
  const validateEmail = (value: string) => {
    const isValidEmail =
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
    setError(!isValidEmail);
    return isValidEmail;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };
  const handleSwitchChange = (checked: boolean) => {
    console.log("Switch is now:", checked ? "ON" : "OFF");
  };
  const generatePassword = () => {

    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";

    let result = "";

    for (let i = 0; i < 10; i++) {

      result += chars.charAt(
        Math.floor(
          Math.random() * chars.length
        )
      );

    }

    setPassword(result);
  };

  // fungsi save
  const handleSubmit = async () => {
    if (confirm("Apakah kamu yakin ingin mengubah pelanggan ini?")) {
      if (!name.trim()) {
        alert("Nama pelanggan wajib diisi");
        return;
      }

      if (!email.trim()) {
        alert("Email wajib diisi");
        return;
      }

      if (!password.trim()) {
        alert("Password wajib diisi");
        return;
      }

      if (!phone.trim()) {
        alert("Nomor handphone wajib diisi");
        return;
      }
      try {

        const token =
          localStorage.getItem("token");

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/customers`,
          {
            name,
            email,
            phone,
            password,
            is_active: isActive,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        alert("Berhasil disimpan");
        navigate("/pelanggan");
      } catch (err) {
        alert(
          err.response?.data?.message ||
          "Gagal simpan"
        );

      }
    }
    

  };

  return (
    <ComponentCard title="Data Pelanggan">
      <div className="space-y-6">
        <div>
          <Label htmlFor="input">Nama Pelanggan</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Masukan Nama Pelanggan"

          />
        </div>
        <div> 
          <Label htmlFor="inputTwo">Email</Label>
          <Input
            type="email"
            value={email}
            error={error}
            onChange={handleEmailChange}
            placeholder="Masukan Email"
             hint={error ? "This is an invalid email address." : ""}
          />
        </div>
        
        <div>
          <Label>Password</Label>

          <div className="flex gap-2">

            <div className="relative flex-1">

              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                readOnly
                placeholder="Klik Generate Password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="
                  absolute
                  right-4
                  top-1/2
                  -translate-y-1/2
                  z-50
                "
              >
                {showPassword ? (
                   <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                )}

              </button>

            </div>

            <button
              type="button"
              onClick={generatePassword}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
            >
              Generate
            </button>

          </div>
        </div>
        <div>
          <Label htmlFor="input">Nomor Handphone</Label>
          <Input
            type="text"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
            placeholder="Masukan Nomor Handphone"
          />
        </div>
        <div>
          <Switch
            label="Aktif"
            defaultChecked={true}
            onChange={(checked) => {
              setIsActive(checked);
            }}
          />
        </div>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="
          px-4
          py-2
          bg-green-600
          text-white
          rounded-lg
        "
        style={{
        marginRight: "5px",

        }}
      >
        Simpan
      </button>
      <a href="/pelanggan">
        <button
          type="button"
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
        >
          Kembali
        </button>
      </a>
      
    </ComponentCard>
  );
}

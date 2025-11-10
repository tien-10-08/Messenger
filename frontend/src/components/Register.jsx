import { useState } from "react";
import { registerUser } from "../api/authService";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await registerUser(form);
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white shadow-lg rounded-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng ký tài khoản</h2>
        <InputField
          label="Tên người dùng"
          name="username"
          value={form.username}
          onChange={handleChange}
          placeholder="Nhập tên..."
        />
        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Nhập email..."
        />
        <InputField
          label="Mật khẩu"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Nhập mật khẩu..."
        />
        <Button text="Đăng ký" type="submit" loading={loading} />
        <p className="text-sm mt-3 text-center">
          Đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;

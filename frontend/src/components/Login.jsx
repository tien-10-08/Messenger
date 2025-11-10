import { useState } from "react";
import { loginUser } from "../api/authService";
import InputField from "../components/InputField";
import Button from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await loginUser(form);
      login(res?.data?.user, res?.data?.token);
      alert("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.error || "Đăng nhập thất bại!");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
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
        <Button text="Đăng nhập" type="submit" loading={loading} />
        <p className="text-sm mt-3 text-center">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="text-blue-500 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;

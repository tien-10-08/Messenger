// src/components/Button.jsx
const Button = ({ text, onClick, type = "button", loading }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`w-full py-2 rounded-lg font-semibold text-white ${
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 transition"
      }`}
    >
      {loading ? "Đang xử lý..." : text}
    </button>
  );
};

export default Button;

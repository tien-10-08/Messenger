// src/components/PrimaryButton.jsx
const PrimaryButton = ({ text, loading, type = "submit" }) => {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full py-2 mt-2 rounded-lg font-semibold text-white transition-all duration-200 ${
        loading
          ? "bg-blue-300 cursor-not-allowed"
          : "bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-md hover:shadow-lg"
      }`}
    >
      {loading ? "Đang xử lý..." : text}
    </button>
  );
};

export default PrimaryButton;

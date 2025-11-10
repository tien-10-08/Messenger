// src/components/InputField.jsx
export const InputField = ({ label, type = "text", name, value, onChange, placeholder }) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
      />
    </div>
  );
};



export const PrimaryButton = ({ text, loading, type = "submit" }) => {
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


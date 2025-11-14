// Modern Form Components with better UX
export const InputField = ({ label, type = "text", name, value, onChange, placeholder }) => {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-200 mb-2">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
      />
    </div>
  );
};

export const PrimaryButton = ({ text, loading, type = "submit" }) => {
  return (
    <button
      type={type}
      disabled={loading}
      className={`w-full py-3 mt-6 rounded-xl font-semibold text-white transition-all duration-200 ${
        loading
          ? "bg-purple-500/50 cursor-not-allowed"
          : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95 shadow-lg hover:shadow-purple-500/50"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Đang xử lý...
        </span>
      ) : (
        text
      )}
    </button>
  );
};


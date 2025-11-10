// src/components/AuthLayout.jsx
const AuthLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-blue-50">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md shadow-xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {title}
        </h2>
        {children}
      </div>
      <p className="mt-6 text-sm text-gray-500">
      </p>
    </div>
  );
};

export default AuthLayout;

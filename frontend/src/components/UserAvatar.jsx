// src/components/UserAvatar.jsx
const UserAvatar = ({ online }) => {
  return (
    <div className="relative">
      <img
        src="https://i.pravatar.cc/40"
        alt="avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
      )}
    </div>
  );
};

export default UserAvatar;

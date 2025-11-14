// Backend Constants - Tập trung quản lý config
export const CONFIG = {
  // JWT
  JWT_EXPIRY: "7d",
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  
  // File uploads
  CLOUDINARY_FOLDER: {
    AVATARS: "messenger/avatars",
    MEDIA: "messenger/media",
  },
  IMAGE_DIMENSIONS: {
    AVATAR_WIDTH: 300,
    AVATAR_HEIGHT: 300,
  },
  ALLOWED_MIME_TYPES: {
    IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    AUDIO: ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg"],
  },
  
  // Message types
  MESSAGE_TYPES: {
    TEXT: "text",
    IMAGE: "image",
    VOICE: "voice",
  },
  
  // User
  SAFE_USER_FIELDS: "_id username email avatar status createdAt",
  DEFAULT_USER_STATUS: "Hey there! I'm using Messenger 😄",
  
  // Validation
  USERNAME_MIN_LENGTH: 2,
  USERNAME_MAX_LENGTH: 50,
  PASSWORD_MIN_LENGTH: 6,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};

export const SOCKET_EVENTS = {
  // User management
  ADD_USER: "addUser",
  GET_USERS: "getUsers",
  PRESENCE_UPDATED: "presenceUpdated",
  
  // Messages
  SEND_MESSAGE: "sendMessage",
  GET_MESSAGE: "getMessage",
  CONVERSATION_HISTORY: "conversationHistory",
  CONVERSATION_UPDATED: "conversationUpdated",
  CONVERSATION_CREATED: "conversationCreated",
  
  // Typing
  TYPING: "typing",
  USER_TYPING: "userTyping",
  
  // Rooms
  JOIN_CONVERSATION: "joinConversation",
  
  // WebRTC Calling
  CALL_USER: "callUser",
  INCOMING_CALL: "incomingCall",
  ANSWER_CALL: "answerCall",
  CALL_ANSWERED: "callAnswered",
  ICE_CANDIDATE: "iceCandidate",
  END_CALL: "endCall",
  CALL_ENDED: "callEnded",
  
  // User updates
  USER_UPDATED: "userUpdated",
  
  // Message seen
  MESSAGE_SEEN: "messageSeen",
  
  // Errors
  ERROR_MESSAGE: "errorMessage",
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

export const ERROR_MESSAGES = {
  // Auth
  AUTH_MISSING_TOKEN: "Thiếu token xác thực",
  AUTH_INVALID_TOKEN: "Token không hợp lệ",
  AUTH_MISSING_CREDENTIALS: "Vui lòng nhập email và mật khẩu",
  AUTH_EMAIL_EXISTS: "Email đã tồn tại",
  AUTH_EMAIL_NOT_FOUND: "Email không tồn tại",
  AUTH_INVALID_PASSWORD: "Sai mật khẩu",
  AUTH_MISSING_FIELDS: "Thiếu thông tin đăng ký",
  
  // User
  USER_NOT_FOUND: "Không tìm thấy người dùng",
  USER_NOT_MEMBER: "Bạn không thuộc cuộc trò chuyện này",
  
  // Conversation
  CONVERSATION_NOT_FOUND: "Conversation không tồn tại",
  CONVERSATION_MISSING_PARTNER: "Thiếu partnerId",
  
  // Messages
  MESSAGE_MISSING_FIELDS: "Thiếu conversationId hoặc text",
  MESSAGE_NOT_FOUND: "Không tìm thấy tin nhắn",
  MESSAGE_MISSING_FILE: "Thiếu file upload",
  
  // File
  FILE_INVALID_TYPE: "Loại file không hợp lệ",
  
  // General
  INTERNAL_ERROR: "Lỗi máy chủ nội bộ",
  NOT_FOUND: "Không tìm thấy",
  UNAUTHORIZED: "Không có quyền",
};

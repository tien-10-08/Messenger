import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";
import { ChatProvider } from "./context/ChatContext";
import ProtectedRoute from "./utils/ProtectedRoute";
import Profile from "./pages/Profile";
import { UserProvider } from "./context/UserContext";
import { SocketProvider } from "./context/SocketContext";
import { CallProvider } from "./context/CallContext";
function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <ChatProvider>
          <SocketProvider>
            <CallProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <ChatPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Router>
            </CallProvider>
          </SocketProvider>
        </ChatProvider>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;

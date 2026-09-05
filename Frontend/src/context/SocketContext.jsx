import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import io from "socket.io-client";

const socketContext = createContext();

export const useSocketContext = () => {
  return useContext(socketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [authUser] = useAuth();

  useEffect(() => {
    if (!authUser) {
      setSocket(null);
      setOnlineUsers([]);
      return;
    }

    const socket = io("https://chatapp-project-wats.onrender.com", {
      query: {
        userId: authUser.user._id,
      },
      withCredentials: true,
    });

    setSocket(socket);

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    socket.on("connect_error", (error) => {
      console.log("Socket connection error:", error.message);
    });

    return () => {
      socket.close();
      setSocket(null);
    };
  }, [authUser]);

  return (
    <socketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </socketContext.Provider>
  );
};
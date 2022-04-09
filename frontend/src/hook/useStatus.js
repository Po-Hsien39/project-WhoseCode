import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const StatusContext = createContext({
  user: {},
  setUser: () => {},
});

const StatusProvider = (props) => {
  const [user, setUser] = useState({ name: 'Tristan' });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(socket);
  }, []);

  return (
    <StatusContext.Provider
      value={{
        user,
        socket,
        setUser,
        setSocket,
      }}
      {...props}
    />
  );
};

function useStatus() {
  return useContext(StatusContext);
}

export { StatusProvider, useStatus };

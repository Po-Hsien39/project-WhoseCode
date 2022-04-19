import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const StatusContext = createContext({
  user: {},
  setUser: () => {},
});

const StatusProvider = (props) => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    login: false,
  });
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_SOCKET_URL);
    setSocket(socket);
  }, []);

  useEffect(() => {
    const getProfileData = async () => {
      const access_token = window.localStorage.getItem('token');
      if (!access_token) return;
      console.log(access_token);
      let res = await axios.get(
        process.env.REACT_APP_DOMAIN + '/api/1.0/user',
        { headers: { authorization: 'Bearer ' + access_token } }
      );
      const { data } = res.data;
      setUser({
        name: data.name,
        email: data.email,
        login: true,
      });
    };

    getProfileData();
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

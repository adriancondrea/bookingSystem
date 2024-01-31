import React, {useContext, useEffect, useState} from 'react';
import {Route, Routes, NavLink, Navigate, Router, BrowserRouter} from 'react-router-dom';
import Properties from './components/Properties';
import Bookings from './components/Bookings';
import UserProfile from './components/UserProfile';
import NotificationBar from './components/NotificationBar';
import UserContext from "./UserContext";
import './App.css';
import Login from "./components/Login";
function App() {
  const [user, setUser] = useState({
    token: localStorage.getItem('userToken'), // Retrieve the token from local storage if available
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <BrowserRouter>
        <Routes>
          {user.token ? (
            <>
              {/* User is logged in */}
              <Route path="/properties" element={<Properties />} />
              {/*<Route path="/bookings" element={<Bookings />} />*/}
              {/*<Route path="/profile" element={<UserProfile />} />*/}
              <Route path="/login" element={<Navigate to="/properties" />} />
              <Route path="/logout" element={<Logout />} />
              <Route path="*" element={<Navigate to="/properties" />} />
            </>
          ) : (
            <>
              {/* User is not logged in */}
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<Navigate to="/login" />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

function Logout() {
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    localStorage.removeItem('userToken'); // Clear the token from local storage
    setUser({ token: null }); // Update user state
  }, []);

  return <Navigate to="/login" />;
}
export default App;

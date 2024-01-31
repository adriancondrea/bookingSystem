import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import UserContext from "../UserContext";
function Login({ history }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate(); // Get the navigate function from the hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3000/api/users/login', credentials);
      let token = response.data.token;
      setUser({ token: token });
      localStorage.setItem('userToken', token); // Store the token
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Set the authorization header for all requests
      navigate('/'); // Navigate to the home page or dashboard after login
    } catch (error) {
    if (error.response) {
      console.error('Login failed:', error.response.data);
      // Handle HTTP response errors
    } else {
      console.error('Login failed:', error.message);
      // Handle non-HTTP errors (network errors, CORS, etc.)
    }
  }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="username" value={credentials.username} onChange={handleChange} placeholder="Username" />
      <input type="password" name="password" value={credentials.password} onChange={handleChange} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;

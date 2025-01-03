import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


const LogoutHandler = ({ logout }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await logout();
      navigate('/login-page');
    };
    performLogout();
  }, [logout, navigate]);

  return null; // This component doesn't render anything
};

export default LogoutHandler;

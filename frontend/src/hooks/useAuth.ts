import { useState, useEffect } from 'react';
import { getUserInfo, logout } from '@/apis/auth/auth';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await getUserInfo();
      setIsLoggedIn(response.data.success);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return {
    isLoggedIn,
    isLoading,
    checkLoginStatus,
    handleLogout,
  };
};

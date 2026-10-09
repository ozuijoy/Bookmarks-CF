import { useState, useEffect } from 'react';
import { StorageService } from '../services/storage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('bookmarks_cf_session');
    if (session) {
      setPassword(session);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (pwd: string) => {
    setLoading(true);
    const isValid = await StorageService.verifyPassword(pwd);
    if (isValid) {
      sessionStorage.setItem('bookmarks_cf_session', pwd);
      setPassword(pwd);
      setIsAuthenticated(true);
      setLoading(false); // 關鍵修復：登錄成功後必須關閉 loading 狀態
      return true;
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem('bookmarks_cf_session');
    // 刷新頁面以清除狀態
    window.location.reload();
  };

  return { isAuthenticated, password, loading, login, logout };
};
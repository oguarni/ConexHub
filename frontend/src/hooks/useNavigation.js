import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const useNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = useCallback((path, options = {}) => {
    navigate(path, options);
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const goHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const isActive = useCallback((path) => {
    if (path === '/' || path === '/products') {
      return location.pathname === '/' || location.pathname === '/products';
    }
    return location.pathname === path;
  }, [location.pathname]);

  return {
    goTo,
    goBack,
    goHome,
    isActive,
    currentPath: location.pathname,
    location
  };
};

export default useNavigation;
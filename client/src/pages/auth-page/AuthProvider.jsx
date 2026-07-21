import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { logoutUser } from '@/store/auth-slice/user';

const useCheckTokenExpiry = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkExpiry = () => {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) return;

      const decodedToken = JSON.parse(atob(accessToken.split('.')[1]));
      const expiryTime = decodedToken.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();

      if (currentTime >= expiryTime) {
        dispatch(logoutUser());
      } else {
        setTimeout(() => {
          dispatch(logoutUser());
        }, expiryTime - currentTime);
      }
    };

    checkExpiry();
  }, [dispatch]);

  return null;
};

export default useCheckTokenExpiry;

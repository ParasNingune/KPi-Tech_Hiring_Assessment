import React, { useEffect } from 'react';
import { Box, useColorMode } from '@chakra-ui/react';
import { useAuth } from './utils/AuthContext';
import LoginPage from './pages/LoginPage';
import CustomerPage from './pages/CustomerPage';
import AdminPage from './pages/AdminPage';

function App() {
  const { isLoggedIn, userRole } = useAuth();
  const { colorMode } = useColorMode();

  useEffect(() => {
    // Apply color mode class to body for CSS background changes
    document.body.className = colorMode;
  }, [colorMode]);

  if (!isLoggedIn) {
    return <LoginPage />;
  }

  return (
    <Box w="100%" minH="100vh">
      {userRole === 'admin' ? <AdminPage /> : <CustomerPage />}
    </Box>
  );
}

export default App;

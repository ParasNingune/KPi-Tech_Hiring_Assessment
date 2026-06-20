import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App';
import { CartProvider } from './utils/CartContext';
import { AuthProvider } from './utils/AuthContext';
import './index.css';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: '#fff5f0',
      100: '#ffe4d6',
      200: '#ffc2a8',
      300: '#ff9b70',
      400: '#ff7a3d',
      500: '#ff6a00',
      600: '#e85b00',
      700: '#c94e00',
      800: '#a53f00',
      900: '#7f3000',
    },
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  radii: {
    xl: '14px',
    '2xl': '18px',
  },
  shadows: {
    soft: '0 14px 45px rgba(15, 23, 42, 0.08)',
    lift: '0 18px 50px rgba(15, 23, 42, 0.14)',
  },
  semanticTokens: {
    colors: {
      'app.bg': { default: '#f7f5f2', _dark: '#0f172a' },
      'app.surface': { default: 'white', _dark: '#1e293b' },
      'app.elevated': { default: 'whiteAlpha.900', _dark: '#243044' },
      'app.mutedSurface': { default: 'gray.50', _dark: '#28364d' },
      'app.input': { default: 'white', _dark: '#111827' },
      'app.border': { default: 'blackAlpha.100', _dark: 'whiteAlpha.200' },
      'app.text': { default: 'gray.800', _dark: 'gray.100' },
      'app.subtleText': { default: 'gray.600', _dark: 'gray.300' },
      'app.faintText': { default: 'gray.500', _dark: 'gray.400' },
      'app.track': { default: 'gray.200', _dark: 'whiteAlpha.300' },
      'app.accentWash': { default: 'orange.50', _dark: 'orange.900' },
    },
  },
  styles: {
    global: {
      body: {
        bg: 'app.bg',
        color: 'app.text',
      },
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '700',
      },
    },
    Card: {
      baseStyle: {
        container: {
          bg: 'app.surface',
          borderColor: 'app.border',
          borderRadius: '2xl',
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </ChakraProvider>
  </React.StrictMode>
);

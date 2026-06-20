import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Text,
  useColorMode,
  Badge,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import MenuManagement from '../components/MenuManagement';
import OrdersManagement from '../components/OrdersManagement';
import Dashboard from '../components/Dashboard';
import { useAuth } from '../utils/AuthContext';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { userEmail, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box minH="100vh" bg="app.bg">
      {/* Sticky Header Navbar */}
      <Box
        bg="app.surface"
        borderBottom="1px solid"
        borderColor="app.border"
        position="sticky"
        top={0}
        zIndex={10}
        backdropFilter="blur(18px)"
        shadow="sm"
      >
        <Container maxW="container.xl" py={4}>
          <HStack justify="space-between" align="center">
            <HStack spacing={3}>
              <Heading size="md" color="brand.500" display="flex" alignItems="center">
                FoodHub Admin <span style={{ marginLeft: '6px' }}>🔑</span>
              </Heading>
              <Badge colorScheme="orange" borderRadius="full" px={2} py={0.5} display={{ base: 'none', md: 'inline-block' }}>
                Operations
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize="sm" color="app.subtleText" display={{ base: 'none', md: 'block' }}>
                {userEmail}
              </Text>
              <Button size="sm" onClick={toggleColorMode} variant="ghost" _hover={{ bg: 'app.accentWash' }}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button size="sm" colorScheme="orange" variant="outline" onClick={logout}>
                Logout
              </Button>
            </HStack>
          </HStack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed-colored" colorScheme="orange">
          <TabList borderColor="app.border">
            <Tab>Dashboard</Tab>
            <Tab>Manage Menu</Tab>
            <Tab>Manage Orders</Tab>
          </TabList>

          <TabPanels bg="app.surface" border="1px solid" borderColor="app.border" borderTop="0" borderBottomRadius="2xl" shadow="soft">
            <TabPanel>
              <Dashboard />
            </TabPanel>
            <TabPanel>
              <MenuManagement />
            </TabPanel>
            <TabPanel>
              <OrdersManagement />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  );
};

export default AdminPage;

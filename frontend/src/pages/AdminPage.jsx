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
      <Box bg="app.surface" borderBottom="1px solid" borderColor="app.border" backdropFilter="blur(18px)">
        <Container maxW="container.xl" py={6}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            spacing={4}
          >
            <Box>
              <Text fontSize="sm" color="blue.500" fontWeight="bold" textTransform="uppercase">
                FoodHub Admin
              </Text>
              <Heading size="lg" color="app.text">
                Operations dashboard
              </Heading>
              <Text color="app.subtleText" fontSize="sm" mt={1}>
                Track orders, menu health, and kitchen activity from one place.
              </Text>
            </Box>
            <HStack spacing={2} justify={{ base: 'space-between', md: 'flex-end' }}>
              <Text fontSize="sm" color="app.subtleText" noOfLines={1}>
                {userEmail}
              </Text>
              <Button size="sm" onClick={toggleColorMode} variant="ghost">
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button size="sm" colorScheme="blue" variant="outline" onClick={logout}>
                Logout
              </Button>
            </HStack>
          </Stack>
        </Container>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed-colored" colorScheme="blue">
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

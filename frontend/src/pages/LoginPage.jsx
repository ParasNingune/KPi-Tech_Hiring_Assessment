import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
  VStack,
  Badge,
  SimpleGrid,
  HStack,
  Icon,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorMode,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../utils/AuthContext';
import { authAPI } from '../utils/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { login } = useAuth();
  const toast = useToast();
  const { colorMode } = useColorMode();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'admin') {
      setTabIndex(0);
    }
  };

  const validatePassword = (pwd) => {
    const constraints = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      symbol: /[!@#$%^&*()_+\-=\[\]{};':"\\\|,.<>\/?]/.test(pwd),
    };
    return constraints;
  };

  const passwordConstraints = validatePassword(password);
  const isPasswordValid = Object.values(passwordConstraints).every((v) => v);

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }



    setLoading(true);
    try {
      const response = await authAPI.login(email, password, role);
      login(response.data.data.email, response.data.data.role);
      toast({
        title: 'Success',
        description: `Logged in as ${role}`,
        status: 'success',
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Login failed';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: 'Weak Password',
        description: 'Password must meet all requirements',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.signup(email, password, role);
      login(response.data.data.email, response.data.data.role);
      toast({
        title: 'Success',
        description: 'Account created and logged in!',
        status: 'success',
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Signup failed';
      toast({
        title: 'Error',
        description: errorMsg,
        status: 'error',
        duration: 3,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Center
      minH="100vh"
      bg="transparent"
      px={4}
      py={10}
    >
      <Card
        width={{ base: '100%', sm: '460px' }}
        shadow="2xl"
        borderRadius="2xl"
        border="1px solid"
        borderColor="app.border"
        overflow="hidden"
        bg="app.surface"
        backdropFilter="blur(18px)"
      >
        <Box h="8px" bgGradient="linear(to-r, brand.500, red.400, blue.400)" />
        <CardBody>
          <VStack spacing={6}>
            <VStack spacing={2} textAlign="center">
              <Badge colorScheme="orange" borderRadius="full" px={3} py={1} letterSpacing="wide">
                Secure sign in
              </Badge>
              <Heading size="xl" bgGradient="linear(to-r, brand.500, red.500)" bgClip="text">
                FoodHub
              </Heading>
              <Text fontSize="sm" color="app.subtleText" maxW="300px">
                Sign in to open the right workspace for your account.
              </Text>
            </VStack>

            <SimpleGrid columns={2} spacing={3} w="full">
              <Button
                h="auto"
                p={3}
                justifyContent="flex-start"
                textAlign="left"
                variant={role === 'customer' ? 'solid' : 'outline'}
                colorScheme="orange"
                borderRadius="xl"
                onClick={() => handleRoleChange('customer')}
                isDisabled={loading}
              >
                <Box>
                  <Text fontSize="xs" opacity={0.78}>Customer</Text>
                  <Text fontSize="sm" fontWeight="semibold">Browse and order</Text>
                </Box>
              </Button>
              <Button
                h="auto"
                p={3}
                justifyContent="flex-start"
                textAlign="left"
                variant={role === 'admin' ? 'solid' : 'outline'}
                colorScheme="blue"
                borderRadius="xl"
                onClick={() => handleRoleChange('admin')}
                isDisabled={loading}
              >
                <Box>
                  <Text fontSize="xs" opacity={0.78}>Admin</Text>
                  <Text fontSize="sm" fontWeight="semibold">Manage operations</Text>
                </Box>
              </Button>
            </SimpleGrid>

            <Box
              w="full"
              bg={colorMode === 'dark' ? (role === 'admin' ? 'blue.900' : 'orange.900') : (role === 'admin' ? 'blue.50' : 'orange.50')}
              borderRadius="xl"
              p={3}
            >
              <Text
                fontSize="sm"
                color={colorMode === 'dark' ? (role === 'admin' ? 'blue.200' : 'orange.200') : (role === 'admin' ? 'blue.700' : 'orange.700')}
                fontWeight="semibold"
              >
                Signing {role === 'admin' ? 'in' : tabIndex === 0 ? 'in' : 'up'} as {role === 'admin' ? 'Admin' : 'Customer'}
              </Text>
            </Box>

            <Tabs index={tabIndex} onChange={setTabIndex} w="full" variant="soft-rounded" colorScheme={role === 'admin' ? 'blue' : 'orange'}>
              {role !== 'admin' && (
                <TabList spacing={2} mb={6}>
                  <Tab flex="1" fontSize="sm" fontWeight="semibold">Login</Tab>
                  <Tab flex="1" fontSize="sm" fontWeight="semibold">Sign Up</Tab>
                </TabList>
              )}

              <TabPanels>
                {/* Login Tab */}
                <TabPanel p={0}>
                  <form onSubmit={handleLogin}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel color="app.text">Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          borderRadius="lg"
                          bg="app.input"
                          borderColor="app.border"
                          color="app.text"
                          _placeholder={{ color: 'app.faintText' }}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel color="app.text">Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          borderColor="app.border"
                          borderRadius="lg"
                          bg="app.input"
                          color="app.text"
                          _placeholder={{ color: 'app.faintText' }}
                        />
                      </FormControl>

                      <Button
                        type="submit"
                        colorScheme={role === 'admin' ? 'blue' : 'orange'}
                        width="100%"
                        isLoading={loading}
                        size="lg"
                        borderRadius="xl"
                        isDisabled={!email || !password}
                      >
                        Login
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>

                {/* Signup Tab */}
                {role !== 'admin' && (
                  <TabPanel p={0}>
                    <form onSubmit={handleSignup}>
                      <VStack spacing={4}>
                        <FormControl isRequired>
                          <FormLabel color="app.text">Email</FormLabel>
                          <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            borderRadius="lg"
                            bg="app.input"
                            borderColor="app.border"
                            color="app.text"
                            _placeholder={{ color: 'app.faintText' }}
                          />
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel color="app.text">Password</FormLabel>
                          <Input
                            type="password"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            borderColor={password && !isPasswordValid ? 'red.500' : 'app.border'}
                            borderRadius="lg"
                            bg="app.input"
                            color="app.text"
                            _placeholder={{ color: 'app.faintText' }}
                          />
                          {password && (
                            <Box mt={3} p={3} bg="app.mutedSurface" borderRadius="lg" fontSize="sm">
                              <Text fontWeight="bold" mb={2} color="app.text">Password requirements:</Text>
                              <VStack align="start" spacing={1} color="app.subtleText">
                                <HStack spacing={2}>
                                  <Icon as={passwordConstraints.length ? CheckCircleIcon : WarningIcon} color={passwordConstraints.length ? 'green.500' : 'red.500'} />
                                  <Text>At least 8 characters</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={passwordConstraints.uppercase ? CheckCircleIcon : WarningIcon} color={passwordConstraints.uppercase ? 'green.500' : 'red.500'} />
                                  <Text>One uppercase letter (A-Z)</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={passwordConstraints.lowercase ? CheckCircleIcon : WarningIcon} color={passwordConstraints.lowercase ? 'green.500' : 'red.500'} />
                                  <Text>One lowercase letter (a-z)</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <Icon as={passwordConstraints.symbol ? CheckCircleIcon : WarningIcon} color={passwordConstraints.symbol ? 'green.500' : 'red.500'} />
                                  <Text>One symbol (!@#$%^&* etc)</Text>
                                </HStack>
                              </VStack>
                            </Box>
                          )}
                        </FormControl>

                        <FormControl isRequired>
                          <FormLabel color="app.text">Confirm Password</FormLabel>
                          <Input
                            type="password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={loading}
                            borderColor={confirmPassword && password !== confirmPassword ? 'red.500' : confirmPassword && password === confirmPassword ? 'green.500' : 'app.border'}
                            borderRadius="lg"
                            bg="app.input"
                            color="app.text"
                            _placeholder={{ color: 'app.faintText' }}
                          />
                          {confirmPassword && password !== confirmPassword && (
                            <Text fontSize="sm" color="red.500" mt={2}>Passwords do not match</Text>
                          )}
                          {confirmPassword && password === confirmPassword && (
                            <Text fontSize="sm" color="green.500" mt={2}>Passwords match ✓</Text>
                          )}
                        </FormControl>

                        <Button
                          type="submit"
                          colorScheme={role === 'admin' ? 'blue' : 'orange'}
                          width="100%"
                          isLoading={loading}
                          size="lg"
                          borderRadius="xl"
                          isDisabled={!isPasswordValid || !email || !password || password !== confirmPassword}
                        >
                          Create Account
                        </Button>
                      </VStack>
                    </form>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>

            <Box pt={4} borderTop="1px solid" borderColor="app.border" width="100%">
              <Text fontSize="xs" color="app.subtleText" textAlign="center">
                Admin: <strong>admin@foodhub.com</strong> / Admin@FoodHub123
              </Text>
              <Text fontSize="xs" color="app.subtleText" textAlign="center" mt={1}>
                Customer: <strong>customer@foodhub.com</strong> / Customer@FoodHub123
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default LoginPage;

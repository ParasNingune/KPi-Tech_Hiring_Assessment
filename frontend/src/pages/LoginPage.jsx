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
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import { useAuth } from '../utils/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const { login } = useAuth();
  const toast = useToast();

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

    setLoading(true);
    try {
      // Simulate login - in production, this would validate against a backend
      login(email, role);
      toast({
        title: 'Success',
        description: `Logged in as ${role}`,
        status: 'success',
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Login failed',
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
      // Simulate signup - in production, this would validate and save to backend
      login(email, role);
      toast({
        title: 'Success',
        description: 'Account created and logged in!',
        status: 'success',
        duration: 3,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Signup failed',
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
      bgGradient="linear(to-br, orange.50, white, cyan.50)"
      px={4}
      py={10}
    >
      <Card
        width={{ base: '100%', sm: '460px' }}
        shadow="2xl"
        borderRadius="2xl"
        border="1px solid"
        borderColor="blackAlpha.100"
        overflow="hidden"
        bg="whiteAlpha.900"
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
              <Text fontSize="sm" color="gray.600" maxW="300px">
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
                onClick={() => setRole('customer')}
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
                onClick={() => setRole('admin')}
                isDisabled={loading}
              >
                <Box>
                  <Text fontSize="xs" opacity={0.78}>Admin</Text>
                  <Text fontSize="sm" fontWeight="semibold">Manage operations</Text>
                </Box>
              </Button>
            </SimpleGrid>

            <Box w="full" bg={role === 'admin' ? 'blue.50' : 'orange.50'} borderRadius="xl" p={3}>
              <Text fontSize="sm" color={role === 'admin' ? 'blue.700' : 'orange.700'} fontWeight="semibold">
                Signing {tabIndex === 0 ? 'in' : 'up'} as {role === 'admin' ? 'Admin' : 'Customer'}
              </Text>
            </Box>

            <Tabs index={tabIndex} onChange={setTabIndex} w="full" variant="soft-rounded" colorScheme={role === 'admin' ? 'blue' : 'orange'}>
              <TabList spacing={2} mb={6}>
                <Tab flex="1" fontSize="sm" fontWeight="semibold">Login</Tab>
                <Tab flex="1" fontSize="sm" fontWeight="semibold">Sign Up</Tab>
              </TabList>

              <TabPanels>
                {/* Login Tab */}
                <TabPanel p={0}>
                  <form onSubmit={handleLogin}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          borderRadius="lg"
                          bg="white"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          borderColor={password && !isPasswordValid ? 'red.500' : undefined}
                          borderRadius="lg"
                          bg="white"
                        />
                        {password && (
                          <Box mt={3} p={3} bg="gray.50" borderRadius="lg" fontSize="sm">
                            <Text fontWeight="bold" mb={2}>Password requirements:</Text>
                            <VStack align="start" spacing={1}>
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

                      <Button
                        type="submit"
                        colorScheme={role === 'admin' ? 'blue' : 'orange'}
                        width="100%"
                        isLoading={loading}
                        size="lg"
                        borderRadius="xl"
                        isDisabled={!isPasswordValid || !email || !password}
                      >
                        Login
                      </Button>
                    </VStack>
                  </form>
                </TabPanel>

                {/* Signup Tab */}
                <TabPanel p={0}>
                  <form onSubmit={handleSignup}>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={loading}
                          borderRadius="lg"
                          bg="white"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={loading}
                          borderColor={password && !isPasswordValid ? 'red.500' : undefined}
                          borderRadius="lg"
                          bg="white"
                        />
                        {password && (
                          <Box mt={3} p={3} bg="gray.50" borderRadius="lg" fontSize="sm">
                            <Text fontWeight="bold" mb={2}>Password requirements:</Text>
                            <VStack align="start" spacing={1}>
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
                        <FormLabel>Confirm Password</FormLabel>
                        <Input
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={loading}
                          borderColor={confirmPassword && password !== confirmPassword ? 'red.500' : confirmPassword && password === confirmPassword ? 'green.500' : undefined}
                          borderRadius="lg"
                          bg="white"
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
              </TabPanels>
            </Tabs>

            <Box pt={4} borderTop="1px solid" borderColor="gray.200" width="100%">
              <Text fontSize="xs" color="gray.500" textAlign="center" mb={2}>
                Demo credentials - Email: any email, Password: Demo!123
              </Text>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Or create a new account with strong password
              </Text>
            </Box>
          </VStack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default LoginPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  Grid,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  Switch,
  Text,
  VStack,
  HStack,
  useToast,
  Spinner,
  Center,
  Badge,
  SimpleGrid,
  useColorMode,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
} from '@chakra-ui/react';
import { MoonIcon, SearchIcon, StarIcon, SunIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import { menuAPI, searchAPI } from '../utils/api';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import RecentOrders from '../components/RecentOrders';
import Chatbot from '../components/Chatbot';

const CustomerPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchMode, setSearchMode] = useState(false);
  const [sortOption, setSortOption] = useState('featured');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure();
  const { isOpen: isOrdersOpen, onOpen: onOrdersOpen, onClose: onOrdersClose } = useDisclosure();
  const toast = useToast();
  const { cart } = useCart();
  const { userEmail, logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();

  const quickTags = ['vegetarian', 'vegan', 'gluten-free', 'spicy', 'high-protein'];

  const displayedItems = [...filteredItems]
    .filter((item) => !availableOnly || item.available)
    .sort((a, b) => {
      if (sortOption === 'price-low') return a.price - b.price;
      if (sortOption === 'price-high') return b.price - a.price;
      if (sortOption === 'name') return a.name.localeCompare(b.name);
      return Number(b.available) - Number(a.available);
    });
  const [personalizedRecs, setPersonalizedRecs] = useState([]);

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

  const loadPersonalizedRecs = async () => {
    if (!userEmail) return;
    try {
      const response = await searchAPI.getPersonalized(userEmail);
      setPersonalizedRecs(response.data.data);
    } catch (error) {
      console.error('Failed to load personalized recommendations', error);
    }
  };

  useEffect(() => {
    if (userEmail) {
      loadPersonalizedRecs();
    }
  }, [userEmail, ordersRefreshKey]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setItems(response.data.data);
      setFilteredItems(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load menu', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await menuAPI.getCategories();
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to load categories');
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setSelectedTag(null);
    setSearchMode(false);
    setSearchQuery('');
    if (category) {
      setFilteredItems(items.filter((item) => item.category === category));
    } else {
      setFilteredItems(items);
    }
  };

  const handleTagFilter = (tag) => {
    setSelectedTag(tag);
    setSelectedCategory(null);
    setSearchMode(false);
    setSearchQuery('');
    if (tag) {
      setFilteredItems(items.filter((item) => (item.dietary_tags || []).includes(tag)));
    } else {
      setFilteredItems(items);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedTag(null);
    setSearchMode(false);
    setSearchQuery('');
    setFilteredItems(items);
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    if (!val.trim()) {
      setSearchMode(false);
      if (selectedCategory) {
        setFilteredItems(items.filter((item) => item.category === selectedCategory));
      } else if (selectedTag) {
        setFilteredItems(items.filter((item) => (item.dietary_tags || []).includes(selectedTag)));
      } else {
        setFilteredItems(items);
      }
    }
  };

  const triggerSearch = async () => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSearchMode(false);
      if (selectedCategory) {
        setFilteredItems(items.filter((item) => item.category === selectedCategory));
      } else if (selectedTag) {
        setFilteredItems(items.filter((item) => (item.dietary_tags || []).includes(selectedTag)));
      } else {
        setFilteredItems(items);
      }
      return;
    }

    try {
      setSearchMode(true);
      setLoading(true);
      const response = await searchAPI.search(query);
      setFilteredItems(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Search failed', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="orange.500" thickness="4px" />
      </Center>
    );
  }

  return (
    <Box bg="app.bg" minH="100vh" pb={10}>
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
                FoodHub <span style={{ marginLeft: '6px' }}>🍔</span>
              </Heading>
              <Badge colorScheme="orange" borderRadius="full" px={2} py={0.5} display={{ base: 'none', md: 'inline-block' }}>
                Customer Portal
              </Badge>
            </HStack>
            <HStack spacing={4}>
              <Text fontSize="sm" color="app.subtleText" display={{ base: 'none', md: 'block' }}>
                {userEmail}
              </Text>
              <Button
                size="sm"
                colorScheme="orange"
                leftIcon={<span>🛒</span>}
                onClick={onCartOpen}
              >
                Cart ({cart.length})
              </Button>
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<TimeIcon />}
                onClick={onOrdersOpen}
              >
                My Orders
              </Button>
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

      <Container maxW="container.xl" pt={8}>
        <Box w="full">
        {/* Main Content */}
        <VStack align="stretch" spacing={6}>
          {/* Personalized Recommendations Section */}
          {personalizedRecs && personalizedRecs.length > 0 && (
            <Box p={5} bg="app.accentWash" borderRadius="2xl" border="1px solid" borderColor="app.border" mb={2}>
              <Heading size="md" mb={1} color="brand.600">
                ✨ Selected For You
              </Heading>
              <Text fontSize="xs" color="app.subtleText" mb={4}>
                Personalized dishes based on your preferences and orders from similar customers.
              </Text>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                {personalizedRecs.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </SimpleGrid>
            </Box>
          )}

          <Box mb={2}>
            <Heading size="lg" mb={1} color="app.text">Explore Menu</Heading>
            <Text fontSize="sm" color="app.subtleText">
              Discover meals that match every craving. Search for spicy, vegetarian, light lunch, or high-protein meals.
            </Text>
          </Box>

          {/* Search Bar */}
          <Card borderRadius="2xl" shadow="soft" overflow="hidden" border="1px solid" borderColor="app.border" bg="app.surface">
            <CardBody>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={3} align="center">
                <InputGroup size="lg" flex={1}>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search menu items (e.g., 'spicy vegetarian', 'light lunch')"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        triggerSearch();
                      }
                    }}
                    borderRadius="xl"
                    bg="app.input"
                  />
                </InputGroup>
                <Button colorScheme="orange" size="lg" onClick={triggerSearch} px={8} borderRadius="xl">
                  Search
                </Button>
                <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} maxW={{ base: 'full', md: '170px' }} borderRadius="xl" bg="app.input">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="name">Name</option>
                </Select>
                <HStack minW="145px" justify="space-between">
                  <Text fontSize="sm" color="app.subtleText">Available Only</Text>
                  <Switch colorScheme="orange" isChecked={availableOnly} onChange={(e) => setAvailableOnly(e.target.checked)} />
                </HStack>
              </Stack>
            </CardBody>
          </Card>

          {/* Categories */}
          {!searchMode && (
            <Box>
              <HStack justify="space-between" mb={3}>
                <Text fontSize="sm" fontWeight="bold" textTransform="uppercase" color="app.faintText">
                  Categories
                </Text>
                {(selectedCategory || selectedTag || searchQuery) && (
                  <Button size="xs" variant="ghost" onClick={clearFilters}>
                    Clear all
                  </Button>
                )}
              </HStack>
              <HStack spacing={3} flexWrap="wrap">
                <Button
                  size="sm"
                  variant={selectedCategory === null ? 'solid' : 'outline'}
                  colorScheme="orange"
                  borderRadius="full"
                  onClick={() => handleCategoryFilter(null)}
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    size="sm"
                    variant={selectedCategory === category ? 'solid' : 'outline'}
                    colorScheme="orange"
                    borderRadius="full"
                    onClick={() => handleCategoryFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </HStack>

              <Text fontSize="sm" fontWeight="bold" mt={5} mb={3} textTransform="uppercase" color="app.faintText">
                Quick filters
              </Text>
              <HStack spacing={3} flexWrap="wrap">
                {quickTags.map((tag) => (
                  <Button
                    key={tag}
                    size="sm"
                    variant={selectedTag === tag ? 'solid' : 'outline'}
                    colorScheme="green"
                    borderRadius="full"
                    onClick={() => handleTagFilter(tag)}
                  >
                    {tag}
                  </Button>
                ))}
              </HStack>
            </Box>
          )}

          {/* Results Info */}
          {searchMode && (
            <Box bg="app.accentWash" p={3} borderRadius="xl">
              <Text fontSize="sm" color="app.text">
                Found {displayedItems.length} item{displayedItems.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </Text>
            </Box>
          )}

          {/* Menu Items Grid */}
          {displayedItems.length > 0 ? (
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr', xl: '1fr 1fr 1fr' }} gap={6}>
              {displayedItems.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </Grid>
          ) : (
            <Center minH="40vh">
              <VStack>
                <Text fontSize="lg" color="app.faintText">
                  No items found
                </Text>
                <Button mt={2} variant="outline" colorScheme="orange" onClick={clearFilters}>
                  Reset filters
                </Button>
              </VStack>
            </Center>
          )}
        </VStack>
        </Box>
      </Container>

      {/* Floating Action Buttons on Bottom Left */}
      <IconButton
        position="fixed"
        bottom="88px"
        right="24px"
        zIndex="1000"
        colorScheme="orange"
        size="lg"
        borderRadius="full"
        shadow="2xl"
        icon={
          <Box position="relative">
            <span style={{ fontSize: '20px' }}>🛒</span>
            {cart.length > 0 && (
              <Badge
                position="absolute"
                top="-8px"
                right="-8px"
                colorScheme="red"
                borderRadius="full"
                fontSize="10px"
                px={1.5}
                py={0.5}
              >
                {cart.length}
              </Badge>
            )}
          </Box>
        }
        onClick={onCartOpen}
        _hover={{ transform: 'scale(1.08)' }}
        transition="all 0.2s ease"
        aria-label="Open Cart"
      />

      <Chatbot />

      {/* Cart Drawer */}
      <Drawer isOpen={isCartOpen} placement="right" onClose={onCartClose} size="md">
        <DrawerOverlay />
        <DrawerContent bg="app.surface" borderLeft="1px solid" borderColor="app.border" overflow="hidden">
          <DrawerCloseButton color="white" zIndex="10" />
          <DrawerBody p={0} overflow="hidden">
            <Cart
              onOrderPlaced={() => {
                setOrdersRefreshKey((key) => key + 1);
                onCartClose();
              }}
              isDrawer={true}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* My Orders Modal */}
      <Modal isOpen={isOrdersOpen} onClose={onOrdersClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden" bg="app.surface" border="1px solid" borderColor="app.border">
          <ModalCloseButton />
          <ModalBody p={0}>
            <RecentOrders userEmail={userEmail} refreshKey={ordersRefreshKey} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CustomerPage;

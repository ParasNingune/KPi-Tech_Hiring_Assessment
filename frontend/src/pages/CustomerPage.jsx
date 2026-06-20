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
} from '@chakra-ui/react';
import { MoonIcon, SearchIcon, StarIcon, SunIcon, TimeIcon, RepeatIcon } from '@chakra-ui/icons';
import { menuAPI, searchAPI } from '../utils/api';
import { useCart } from '../utils/CartContext';
import { useAuth } from '../utils/AuthContext';
import MenuItemCard from '../components/MenuItemCard';
import Cart from '../components/Cart';
import RecentOrders from '../components/RecentOrders';

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

  const featuredItems = items.filter((item) => item.available).slice(0, 3);

  useEffect(() => {
    loadMenuItems();
    loadCategories();
  }, []);

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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchMode(false);
      handleCategoryFilter(selectedCategory);
      return;
    }

    try {
      setSearchMode(true);
      const response = await searchAPI.search(query);
      setFilteredItems(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Search failed', status: 'error' });
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
      <Box color="white" px={4} pt={5} pb={10} mb={8} position="relative" overflow="hidden">
        <Box position="absolute" inset={0} bgGradient="linear(135deg, #fb6a13, #ef4444 48%, #0f766e)" />
        <Box position="absolute" inset={0} opacity={0.25} bg="radial-gradient(circle at 80% 20%, white 0, transparent 18rem)" />
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align={{ base: 'stretch', md: 'center' }}
            spacing={4}
            mb={10}
          >
            <Box>
              <Heading size="lg">FoodHub</Heading>
              <Text fontSize="sm" opacity={0.85}>Customer ordering</Text>
            </Box>
            <HStack spacing={2} justify={{ base: 'space-between', md: 'flex-end' }}>
              <Text fontSize="sm" opacity={0.9} noOfLines={1}>
                {userEmail}
              </Text>
              <Button size="sm" onClick={toggleColorMode} variant="ghost" color="white" _hover={{ bg: 'whiteAlpha.200' }}>
                {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
              </Button>
              <Button size="sm" bg="white" color="brand.600" _hover={{ bg: 'orange.50' }} onClick={logout}>
                Logout
              </Button>
            </HStack>
          </Stack>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8} alignItems="center">
            <Box>
              <Badge bg="whiteAlpha.300" color="white" px={3} py={1} borderRadius="full" mb={4}>
                Fresh meals, fast checkout
              </Badge>
              <Heading size="2xl" lineHeight="1.1" maxW="560px">
                Discover meals that match every craving.
              </Heading>
              <Text mt={4} fontSize="lg" maxW="520px" opacity={0.95}>
                Search, filter, add to cart, and checkout with a polished restaurant ordering experience.
              </Text>
              <HStack mt={6} spacing={4} wrap="wrap">
                <HStack bg="whiteAlpha.200" px={4} py={2} borderRadius="full">
                  <StarIcon />
                  <Text fontSize="sm">Top-rated dishes</Text>
                </HStack>
                <HStack bg="whiteAlpha.200" px={4} py={2} borderRadius="full">
                  <TimeIcon />
                  <Text fontSize="sm">Fast checkout</Text>
                </HStack>
                <HStack bg="whiteAlpha.200" px={4} py={2} borderRadius="full">
                  <RepeatIcon />
                  <Text fontSize="sm">Live order tracking</Text>
                </HStack>
              </HStack>
            </Box>
            <Box>
              <Card borderRadius="2xl" shadow="lift" overflow="hidden" bg="app.surface" border="1px solid" borderColor="app.border">
                <CardBody>
                  <Heading size="md" mb={2} color="app.text">
                    What are you craving today?
                  </Heading>
                  <Text color="app.subtleText" mb={4}>
                    Search for spicy, vegetarian, light lunch, or high-protein meals.
                  </Text>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search menu items (e.g., 'spicy vegetarian', 'light lunch')"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      borderRadius="xl"
                      bg="app.input"
                    />
                  </InputGroup>
                  {featuredItems.length > 0 && (
                    <Stack mt={5} spacing={2}>
                      <Text color="app.faintText" fontSize="xs" fontWeight="bold" textTransform="uppercase">
                        Popular now
                      </Text>
                      {featuredItems.map((item) => (
                        <HStack key={item.id} justify="space-between" bg="app.accentWash" p={3} borderRadius="xl">
                          <Text color="app.text" fontWeight="semibold" fontSize="sm" noOfLines={1}>
                            {item.name}
                          </Text>
                          <Badge colorScheme="orange">${item.price.toFixed(2)}</Badge>
                        </HStack>
                      ))}
                    </Stack>
                  )}
                </CardBody>
              </Card>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: '1fr 350px' }} gap={6} alignItems="start">
        {/* Main Content */}
        <VStack align="stretch" spacing={6}>
          <SimpleGrid columns={{ base: 1, sm: 3 }} spacing={4}>
            <Card borderRadius="2xl" shadow="sm" bg="app.surface" border="1px solid" borderColor="app.border">
              <CardBody>
                <Text fontSize="sm" color="app.faintText">Items</Text>
                <Heading size="md" color="brand.500">{items.length}</Heading>
              </CardBody>
            </Card>
            <Card borderRadius="2xl" shadow="sm" bg="app.surface" border="1px solid" borderColor="app.border">
              <CardBody>
                <Text fontSize="sm" color="app.faintText">Categories</Text>
                <Heading size="md" color="brand.500">{categories.length}</Heading>
              </CardBody>
            </Card>
            <Card borderRadius="2xl" shadow="sm" bg="app.surface" border="1px solid" borderColor="app.border">
              <CardBody>
                <Text fontSize="sm" color="app.faintText">In cart</Text>
                <Heading size="md" color="brand.500">{cart.length}</Heading>
              </CardBody>
            </Card>
          </SimpleGrid>

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
                    onChange={(e) => handleSearch(e.target.value)}
                    borderRadius="xl"
                    bg="app.input"
                  />
                </InputGroup>
                <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} maxW={{ base: 'full', md: '190px' }} borderRadius="xl" bg="app.input">
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to high</option>
                  <option value="price-high">Price: High to low</option>
                  <option value="name">Name</option>
                </Select>
                <HStack minW="145px" justify="space-between">
                  <Text fontSize="sm" color="app.subtleText">Available</Text>
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
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
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

        {/* Cart Sidebar */}
        <Box position={{ base: 'relative', lg: 'sticky' }} top={6} h="fit-content">
          <Stack spacing={6}>
            <RecentOrders userEmail={userEmail} refreshKey={ordersRefreshKey} />
            <Cart onOrderPlaced={() => setOrdersRefreshKey((key) => key + 1)} />
          </Stack>
        </Box>
      </Grid>
      </Container>
    </Box>
  );
};

export default CustomerPage;

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  Spinner,
  Stack,
  Tag,
  Textarea,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  Text,
  Checkbox,
  CheckboxGroup,
  Center,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { menuAPI } from '../utils/api';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    dietary_tags: [],
    available: true,
  });
  const [allTags] = useState(['vegetarian', 'vegan', 'gluten-free', 'spicy', 'high-protein']);
  const [categories] = useState(['Appetizers', 'Main Courses', 'Desserts', 'Beverages']);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await menuAPI.getAll();
      setItems(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load menu items', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleTagsChange = (tags) => {
    setFormData((prev) => ({ ...prev, dietary_tags: tags }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        description: item.description,
        category: item.category,
        price: item.price.toString(),
        dietary_tags: item.dietary_tags || [],
        available: item.available,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        dietary_tags: [],
        available: true,
      });
    }
    onOpen();
  };

  const handleSaveItem = async () => {
    // Validation
    if (!formData.name || !formData.description || !formData.category || !formData.price) {
      toast({ title: 'Error', description: 'Please fill all required fields', status: 'error' });
      return;
    }

    try {
      if (editingItem) {
        await menuAPI.update(editingItem.id, formData);
        toast({
          title: 'Success',
          description: 'Item updated successfully',
          status: 'success',
        });
      } else {
        await menuAPI.create(formData);
        toast({
          title: 'Success',
          description: 'Item created successfully',
          status: 'success',
        });
      }
      await loadItems();
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Operation failed',
        status: 'error',
      });
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await menuAPI.delete(id);
        toast({ title: 'Success', description: 'Item deleted', status: 'success' });
        await loadItems();
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete item', status: 'error' });
      }
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="orange.500" />
      </Center>
    );
  }

  return (
    <Box>
      <HStack mb={6} justify="space-between" align={{ base: 'start', md: 'center' }} flexWrap="wrap" gap={3}>
        <Box>
          <Heading size="md">Menu Items ({items.length})</Heading>
          <Text color="gray.500" fontSize="sm" mt={1}>
            Keep the live menu fresh, priced, and available.
          </Text>
        </Box>
        <Button colorScheme="orange" onClick={() => handleOpenModal()} borderRadius="full" shadow="sm">
          + Add New Item
        </Button>
      </HStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={6}>
        {items.map((item) => (
          <Card key={item.id} shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface">
            <CardHeader pb={2}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1} flex={1}>
                  <Heading size="sm">{item.name}</Heading>
                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                    {item.description}
                  </Text>
                </VStack>
                <HStack spacing={1}>
                  <IconButton size="sm" icon={<EditIcon />} onClick={() => handleOpenModal(item)} variant="ghost" />
                  <IconButton
                    size="sm"
                    icon={<DeleteIcon />}
                    onClick={() => handleDeleteItem(item.id)}
                    colorScheme="red"
                    variant="ghost"
                  />
                </HStack>
              </HStack>
            </CardHeader>
            <Divider />
            <CardBody>
              <VStack align="start" spacing={2}>
                <HStack w="full" justify="space-between">
                  <Text fontSize="sm" fontWeight="bold" color="brand.500">
                    ₹{item.price.toFixed(2)}
                  </Text>
                  <Tag size="sm">{item.category}</Tag>
                </HStack>
                <HStack spacing={1} flexWrap="wrap">
                  {item.dietary_tags.map((tag) => (
                    <Tag key={tag} size="xs" colorScheme="green" variant="subtle">
                      {tag}
                    </Tag>
                  ))}
                </HStack>
                <Tag colorScheme={item.available ? 'green' : 'red'} size="sm">
                  {item.available ? 'Available' : 'Out of Stock'}
                </Tag>
              </VStack>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Add/Edit Item Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent bg="app.surface" border="1px solid" borderColor="app.border" borderRadius="2xl">
          <ModalHeader>{editingItem ? 'Edit Item' : 'Add New Item'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input name="name" value={formData.name} onChange={handleInputChange} placeholder="Item name" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Item description"
                  size="sm"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Category</FormLabel>
                <select name="category" value={formData.category} onChange={handleInputChange} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e0' }}>
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Price (₹)</FormLabel>
                <NumberInput value={formData.price} onChange={(val) => setFormData((prev) => ({ ...prev, price: val }))} min={0}>
                  <NumberInputField />
                </NumberInput>
              </FormControl>

              <FormControl>
                <FormLabel>Dietary Tags</FormLabel>
                <CheckboxGroup value={formData.dietary_tags} onChange={handleTagsChange}>
                  <Stack spacing={2}>
                    {allTags.map((tag) => (
                      <Checkbox key={tag} value={tag}>
                        {tag}
                      </Checkbox>
                    ))}
                  </Stack>
                </CheckboxGroup>
              </FormControl>

              <FormControl>
                <Checkbox name="available" isChecked={formData.available} onChange={handleInputChange}>
                  Available
                </Checkbox>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={handleSaveItem}>
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
      );
    };

    export default MenuManagement;

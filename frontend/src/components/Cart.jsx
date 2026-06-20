import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Input,
  Stack,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Textarea,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
  Spinner,
  Center,
  Badge,
  Select,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useCart } from '../utils/CartContext';
import { orderAPI, searchAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

const Cart = ({ onOrderPlaced, isDrawer }) => {
  const { cart, removeItem, updateQuantity, getTotalPrice, clearCart, addItem } = useCart();
  const { userEmail } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [recommendations, setRecommendations] = React.useState([]);
  const [loadingRecs, setLoadingRecs] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    const fetchRecommendations = async () => {
      if (cart.length === 0) {
        setRecommendations([]);
        return;
      }
      try {
        setLoadingRecs(true);
        const lastItem = cart[cart.length - 1];
        const response = await searchAPI.getFrequentlyBought(lastItem.id);
        setRecommendations(response.data.data);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      } finally {
        setLoadingRecs(false);
      }
    };
    fetchRecommendations();
  }, [cart]);

  const [formData, setFormData] = React.useState({
    customer_name: '',
    customer_email: userEmail || '',
    customer_phone: '',
    special_instructions: '',
    pickup_time: 'ASAP',
  });
  const [submitting, setSubmitting] = React.useState(false);

  const totalPrice = getTotalPrice();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckout = async () => {
    // Validation
    if (!formData.customer_name.trim() || !formData.customer_email.trim() || !formData.customer_phone.trim()) {
      toast({ title: 'Error', description: 'Please fill all required fields', status: 'error' });
      return;
    }

    try {
      setSubmitting(true);
      const orderData = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        special_instructions: [
          `Pickup: ${formData.pickup_time}`,
          formData.special_instructions.trim(),
        ].filter(Boolean).join(' | '),
        items: cart.map((item) => ({ menu_item_id: item.id, quantity: item.quantity })),
      };

      const response = await orderAPI.create(orderData);

      toast({
        title: 'Order placed successfully!',
        description: `Order #${response.data.data.id} has been placed`,
        status: 'success',
        duration: 3,
      });

      clearCart();
      onOrderPlaced?.();
      setFormData({
        customer_name: '',
        customer_email: userEmail || '',
        customer_phone: '',
        special_instructions: '',
        pickup_time: 'ASAP',
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to place order',
        status: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Card
        w="full"
        h={isDrawer ? "100%" : "auto"}
        borderRadius={isDrawer ? "0" : "2xl"}
        overflowY="auto"
        border={isDrawer ? "none" : "1px solid"}
        borderColor="app.border"
        bg="app.surface"
        shadow={isDrawer ? "none" : "soft"}
      >
        <CardHeader bgGradient="linear(to-r, orange.500, red.500)" color="white">
          <HStack justify="space-between">
            <Heading size="md">Your Cart</Heading>
            <Badge colorScheme="blackAlpha" variant="solid" borderRadius="full" px={2}>
              {cart.length} items
            </Badge>
          </HStack>
        </CardHeader>
        <Divider />
        <CardBody>
          {cart.length === 0 ? (
            <VStack color="app.faintText" textAlign="center" py={10} spacing={2}>
              <Heading size="sm" color="app.subtleText">Your cart is empty</Heading>
              <Text fontSize="sm">Add a dish to start your order.</Text>
            </VStack>
          ) : (
            <VStack spacing={4}>
              {cart.map((item) => (
                <Box key={item.id} w="full" p={3} bg="app.mutedSurface" borderRadius="xl" border="1px solid" borderColor="app.border">
                  <HStack justify="space-between" mb={2}>
                    <VStack align="start" spacing={0} flex={1}>
                      <Text fontWeight="bold" fontSize="sm">
                        {item.name}
                      </Text>
                      <Text fontSize="xs" color="app.subtleText">
                        ₹{item.price.toFixed(2)} each
                      </Text>
                    </VStack>
                    <Button size="xs" colorScheme="red" variant="ghost" onClick={() => removeItem(item.id)}>
                      <DeleteIcon />
                    </Button>
                  </HStack>
                  <HStack>
                    <Button size="xs" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      −
                    </Button>
                    <Text fontSize="sm" fontWeight="bold" minW="30px" textAlign="center">
                      {item.quantity}
                    </Text>
                    <Button size="xs" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      +
                    </Button>
                    <Text fontSize="sm" ml="auto" fontWeight="bold">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </HStack>
                </Box>
              ))}

              <Divider />

              {/* AI Recommended Pairings */}
              {recommendations.length > 0 && (
                <VStack align="stretch" spacing={2} w="full" py={1}>
                  <Text fontSize="xs" fontWeight="bold" color="app.faintText" textTransform="uppercase">
                    ✨ Suggested Pairings
                  </Text>
                  <Stack spacing={2}>
                    {recommendations.map((rec) => (
                      <HStack key={rec.id} p={2} bg="app.accentWash" borderRadius="xl" justify="space-between" border="1px solid" borderColor="app.border">
                        <VStack align="start" spacing={0} flex={1}>
                          <Text fontSize="xs" fontWeight="bold" color="app.text">
                            {rec.name}
                          </Text>
                          {rec.recommendation_reason && (
                            <Text fontSize="10px" color="app.subtleText" fontStyle="italic" noOfLines={2}>
                              {rec.recommendation_reason}
                            </Text>
                          )}
                        </VStack>
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="bold" color="brand.500">
                            ₹{rec.price.toFixed(2)}
                          </Text>
                          <Button
                            size="xs"
                            colorScheme="orange"
                            borderRadius="full"
                            onClick={() => {
                              addItem({
                                id: rec.id,
                                name: rec.name,
                                price: rec.price,
                                quantity: 1,
                                description: rec.description
                              });
                              toast({
                                title: 'Added to cart',
                                description: `${rec.name} added`,
                                status: 'success',
                                duration: 1.5,
                              });
                            }}
                          >
                            + Add
                          </Button>
                        </HStack>
                      </HStack>
                    ))}
                  </Stack>
                  <Divider />
                </VStack>
              )}

              <Box w="full">
                <HStack justify="space-between" mb={4}>
                  <Text fontWeight="bold">Total:</Text>
                  <Heading size="lg" color="brand.500">
                    ₹{totalPrice.toFixed(2)}
                  </Heading>
                </HStack>

                <Button w="full" colorScheme="orange" size="lg" onClick={onOpen} isDisabled={cart.length === 0} borderRadius="full">
                  Checkout
                </Button>
                <Button w="full" mt={2} variant="ghost" size="sm" onClick={clearCart}>
                  Clear cart
                </Button>
              </Box>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Checkout Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" bg="app.surface" border="1px solid" borderColor="app.border">
          <ModalHeader>Checkout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Phone</FormLabel>
                <Input
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  placeholder="(123) 456-7890"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Pickup Time</FormLabel>
                <Select name="pickup_time" value={formData.pickup_time} onChange={handleInputChange}>
                  <option value="ASAP">ASAP</option>
                  <option value="15 minutes">15 minutes</option>
                  <option value="30 minutes">30 minutes</option>
                  <option value="45 minutes">45 minutes</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Special Instructions</FormLabel>
                <Textarea
                  name="special_instructions"
                  value={formData.special_instructions}
                  onChange={handleInputChange}
                  placeholder="Any special requests or dietary notes?"
                  size="sm"
                />
              </FormControl>

              <Box w="full" p={4} bg="app.accentWash" borderRadius="lg">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Order Total:</Text>
                  <Heading size="md" color="brand.500">
                    ₹{totalPrice.toFixed(2)}
                  </Heading>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" isLoading={submitting} onClick={handleCheckout}>
              Place Order
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Cart;

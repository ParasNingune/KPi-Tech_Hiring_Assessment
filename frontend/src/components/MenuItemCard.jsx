import React from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Image,
  Tag,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { useCart } from '../utils/CartContext';

const categoryImages = {
  Appetizers: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=900&q=80',
  'Main Courses': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  Desserts: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80',
};

const MenuItemCard = ({ item }) => {
  const { addItem } = useCart();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [quantity, setQuantity] = React.useState(1);
  const toast = useToast();

  const handleAddToCart = () => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: parseInt(quantity),
      description: item.description,
    });
    toast({
      title: 'Added to cart',
      description: `${item.name} x${quantity} added`,
      status: 'success',
      duration: 2,
    });
    onClose();
    setQuantity(1);
  };

  return (
    <>
      <Card
        h="full"
        transition="all 0.25s ease"
        _hover={{ shadow: 'lift', transform: 'translateY(-6px)' }}
        cursor="pointer"
        onClick={onOpen}
        borderRadius="2xl"
        overflow="hidden"
        border="1px solid"
        borderColor="blackAlpha.100"
        bg="white"
      >
        <Box h="158px" bgGradient="linear(to-br, orange.300, red.400)" position="relative">
          <Image
            src={categoryImages[item.category]}
            alt={item.category}
            w="full"
            h="full"
            objectFit="cover"
            fallback={<Box w="full" h="full" bgGradient="linear(to-br, orange.300, red.400)" />}
          />
          <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.700, transparent 58%)" />
          <Box position="absolute" bottom={3} left={4} right={4}>
            <HStack justify="space-between" align="center">
              <Badge bg="whiteAlpha.900" color="gray.800" px={2} borderRadius="full">
                {item.category}
              </Badge>
              {!item.available && <Tag colorScheme="red">Out of Stock</Tag>}
            </HStack>
          </Box>
        </Box>
        <CardHeader pb={3}>
          <HStack justify="space-between" align="start" mb={2}>
            <VStack align="start" spacing={1} flex={1}>
              <Heading size="sm">{item.name}</Heading>
              <Text fontSize="xs" color="gray.600" noOfLines={2}>
                {item.description}
              </Text>
            </VStack>
          </HStack>
        </CardHeader>

        <CardBody>
          <VStack align="start" spacing={3}>
            {item.dietary_tags && item.dietary_tags.length > 0 && (
              <HStack spacing={2}>
                {item.dietary_tags.map((tag) => (
                  <Tag key={tag} size="sm" colorScheme="green" variant="subtle" borderRadius="full">
                    {tag}
                  </Tag>
                ))}
              </HStack>
            )}

            <HStack justify="space-between" w="full" pt={2} borderTop="1px solid" borderColor="gray.100">
              <Heading size="md" color="brand.500">
                ${item.price.toFixed(2)}
              </Heading>
              <Button
                size="sm"
                colorScheme="orange"
                isDisabled={!item.available}
                borderRadius="full"
                shadow="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpen();
                }}
              >
                <AddIcon mr={1} /> Add
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Add to Cart Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="2xl" overflow="hidden">
          <Box h="160px" position="relative">
            <Image
              src={categoryImages[item.category]}
              alt={item.category}
              w="full"
              h="full"
              objectFit="cover"
              fallback={<Box w="full" h="full" bgGradient="linear(to-br, orange.300, red.400)" />}
            />
            <Box position="absolute" inset={0} bgGradient="linear(to-t, blackAlpha.600, transparent)" />
          </Box>
          <ModalHeader>{item.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text color="gray.600">{item.description}</Text>
              <FormControl>
                <FormLabel>Quantity</FormLabel>
                <NumberInput
                  value={quantity}
                  onChange={(val) => setQuantity(val)}
                  min={1}
                  max={10}
                >
                  <NumberInputField />
                </NumberInput>
              </FormControl>
              <Box w="full" p={3} bg="orange.50" borderRadius="xl">
                <HStack justify="space-between">
                  <Text fontWeight="bold">Subtotal:</Text>
                  <Heading size="md" color="brand.500">
                    ${(item.price * quantity).toFixed(2)}
                  </Heading>
                </HStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="orange" onClick={handleAddToCart} isDisabled={!item.available}>
              Add to Cart
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MenuItemCard;

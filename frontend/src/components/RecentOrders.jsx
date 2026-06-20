import React, { useEffect, useMemo, useState } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { RepeatIcon, SearchIcon, TimeIcon } from '@chakra-ui/icons';
import { orderAPI } from '../utils/api';

const statusSteps = ['Placed', 'Confirmed', 'Preparing', 'Ready', 'Picked Up'];

const getStatusColor = (status) => {
  const colors = {
    Placed: 'blue',
    Confirmed: 'cyan',
    Preparing: 'orange',
    Ready: 'green',
    'Picked Up': 'purple',
  };
  return colors[status] || 'gray';
};

const OrderCard = ({ order, orderNumber }) => {
  const activeIndex = Math.max(statusSteps.indexOf(order.status), 0);
  const itemSummary = order.items
    .map((item) => `${item.menu_item.name} x${item.quantity}`)
    .join(', ');

  const displayId = orderNumber !== undefined && orderNumber !== null ? orderNumber : order.id;

  return (
    <Box bg="app.mutedSurface" border="1px solid" borderColor="app.border" borderRadius="xl" p={4}>
      <Stack spacing={3}>
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="sm">Order #{displayId}</Heading>
            <HStack color="app.faintText" fontSize="xs" mt={1}>
              <TimeIcon />
              <Text>{new Date(order.created_at).toLocaleString()}</Text>
            </HStack>
          </Box>
          <Badge colorScheme={getStatusColor(order.status)} borderRadius="full" px={3} py={1}>
            {order.status}
          </Badge>
        </HStack>

        <Text fontSize="sm" color="app.subtleText" noOfLines={2}>
          {itemSummary}
        </Text>

        <HStack justify="space-between">
          <Text fontSize="sm" color="app.subtleText">Total</Text>
          <Heading size="sm" color="brand.500">₹{order.total_price.toFixed(2)}</Heading>
        </HStack>

        <HStack spacing={2}>
          {statusSteps.map((step, index) => (
            <Box key={step} flex={1}>
              <Box
                h="8px"
                borderRadius="full"
                bg={index <= activeIndex ? `${getStatusColor(order.status)}.400` : 'app.track'}
              />
              <Text
                mt={1}
                fontSize="10px"
                color={index <= activeIndex ? 'app.text' : 'app.faintText'}
                noOfLines={1}
              >
                {step}
              </Text>
            </Box>
          ))}
        </HStack>
      </Stack>
    </Box>
  );
};

const RecentOrders = ({ userEmail, refreshKey = 0 }) => {
  const [orders, setOrders] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [lookupOrder, setLookupOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lookupLoading, setLookupLoading] = useState(false);
  const toast = useToast();

  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);

  const loadOrders = async () => {
    if (!userEmail) return;

    try {
      setLoading(true);
      const response = await orderAPI.getByEmail(userEmail);
      setOrders(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load recent orders', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    if (!orderId.trim()) {
      toast({ title: 'Order number required', description: 'Enter an order number to check its status.', status: 'warning' });
      return;
    }

    const seqNum = parseInt(orderId.trim());
    if (!isNaN(seqNum)) {
      const found = orders.find((o, idx) => (orders.length - idx) === seqNum || o.id === seqNum);
      if (found) {
        setLookupOrder(found);
        return;
      }
    }

    try {
      setLookupLoading(true);
      const response = await orderAPI.getById(orderId.trim());
      const order = response.data.data;

      if (order.customer_email.toLowerCase() !== userEmail.toLowerCase()) {
        setLookupOrder(null);
        toast({ title: 'Order not found', description: 'That order is not linked to this signed-in email.', status: 'warning' });
        return;
      }

      setLookupOrder(order);
    } catch (error) {
      setLookupOrder(null);
      toast({ title: 'Order not found', description: 'Please check the order number and try again.', status: 'error' });
    } finally {
      setLookupLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [userEmail, refreshKey]);

  // Compute sequential order number for lookupOrder if available
  const lookupIndex = lookupOrder ? orders.findIndex((o) => o.id === lookupOrder.id) : -1;
  const lookupOrderNumber = lookupIndex !== -1 ? orders.length - lookupIndex : lookupOrder?.id;

  return (
    <Card borderRadius="2xl" border="1px solid" borderColor="app.border" bg="app.surface" shadow="soft" overflow="hidden">
      <CardHeader bg="app.surface">
        <HStack justify="space-between" align="start">
          <Box>
            <Heading size="md" color="app.text">Recent Orders</Heading>
            <Text color="app.subtleText" fontSize="sm" mt={1}>Track status for orders placed with this email.</Text>
          </Box>
          <Button size="sm" variant="ghost" onClick={loadOrders} isLoading={loading}>
            <RepeatIcon />
          </Button>
        </HStack>
      </CardHeader>
      <Divider />
      <CardBody>
        <Stack spacing={4}>
          <InputGroup>
            <Input
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Check status by order #"
              bg="app.input"
              borderRadius="xl"
            />
            <InputRightElement width="4.5rem">
              <Button size="sm" colorScheme="orange" onClick={handleLookup} isLoading={lookupLoading}>
                <SearchIcon />
              </Button>
            </InputRightElement>
          </InputGroup>

          {lookupOrder && <OrderCard order={lookupOrder} orderNumber={lookupOrderNumber} />}

          {loading ? (
            <VStack py={6}>
              <Spinner color="orange.500" />
              <Text color="app.faintText" fontSize="sm">Loading your recent orders...</Text>
            </VStack>
          ) : recentOrders.length > 0 ? (
            <Stack spacing={3}>
              {recentOrders.map((order) => {
                const originalIndex = orders.findIndex((o) => o.id === order.id);
                const orderNumber = originalIndex !== -1 ? orders.length - originalIndex : order.id;
                return (
                  <OrderCard
                    key={order.id}
                    order={order}
                    orderNumber={orderNumber}
                  />
                );
              })}
            </Stack>
          ) : (
            <Box bg="app.accentWash" borderRadius="xl" p={4} textAlign="center" border="1px solid" borderColor="app.border">
              <Heading size="sm" color="brand.600">No recent orders yet</Heading>
              <Text color="app.subtleText" fontSize="sm" mt={1}>Place an order and it will appear here with live status.</Text>
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default RecentOrders;

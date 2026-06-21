import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  Heading,
  Select,
  Spinner,
  Stack,
  Text,
  VStack,
  HStack,
  Tag,
  useToast,
  Center,
} from '@chakra-ui/react';
import { orderAPI } from '../utils/api';

const OrdersManagement = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;
  const toast = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredOrders.length]);

  useEffect(() => {
    if (statusFilter) {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    } else {
      setFilteredOrders(orders);
    }
  }, [statusFilter, orders]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load orders', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
        status: 'success',
      });
      await loadOrders();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to update status',
        status: 'error',
      });
    }
  };

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

  const sortedOrders = [...filteredOrders].sort((a, b) => b.id - a.id);

  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage);

  const paginatedOrders = sortedOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

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
          <Heading size="md" color="app.text">Orders ({filteredOrders.length})</Heading>
          <Text color="app.subtleText" fontSize="sm" mt={1}>
            Prioritize kitchen flow and keep guests updated.
          </Text>
        </Box>
        <HStack spacing={3} w={{ base: 'full', md: 'auto' }} justify={{ base: 'space-between', md: 'flex-end' }}>
          <Button colorScheme="orange" onClick={loadOrders} borderRadius="full" shadow="sm" size="sm">
            Refresh Orders
          </Button>
          <Select
            w="200px"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Picked Up">Picked Up</option>
          </Select>
        </HStack>
      </HStack>

      <VStack spacing={4}>
        {paginatedOrders.length > 0 ? (
        paginatedOrders.map((order) => (
            <Card key={order.id} w="full" shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface">
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Heading size="sm">Order #{order.id}</Heading>
                    <Text fontSize="xs">
                      {order.customer_name} • {order.customer_email}
                    </Text>
                    <Text fontSize="xs">
                      {new Date(order.created_at).toLocaleString()}
                    </Text>
                  </VStack>
                  <VStack align="end" spacing={2}>
                    <Heading size="sm" color="green">
                      ₹{order.total_price.toFixed(2)}
                    </Heading>
                    <Tag colorScheme={getStatusColor(order.status)}>{order.status}</Tag>
                  </VStack>
                </HStack>
              </CardHeader>
              <Divider />
              <CardBody>
                <VStack align="start" spacing={3}>
                  {/* Items */}
                  <Box w="full">
                    <Text fontSize="sm" fontWeight="bold" mb={2}>
                      Items:
                    </Text>
                    <VStack align="start" spacing={1} pl={4}>
                      {order.items.map((item, idx) => (
                        <Text key={idx} fontSize="sm">
                          • {item.menu_item.name} x{item.quantity} = ₹{item.subtotal.toFixed(2)}
                        </Text>
                      ))}
                    </VStack>
                  </Box>

                  {/* Special Instructions */}
                  {order.special_instructions && (
                    <Box w="full" p={2} bg="app.accentWash" borderRadius="md" border="1px solid" borderColor="app.border">
                      <Text fontSize="sm">
                        <strong>Special Instructions:</strong> {order.special_instructions}
                      </Text>
                    </Box>
                  )}

                  {/* Status Update */}
                  <HStack w="full" mt={4}>
                    <Text fontSize="sm" fontWeight="bold">
                      Update Status:
                    </Text>
                    <Select
                      w="auto"
                      size="sm"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="Placed">Placed</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Picked Up">Picked Up</option>
                    </Select>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))
        ) : (
          <Center minH="40vh" w="full">
            <Text color="gray.500">No orders found</Text>
          </Center>
        )}
        {totalPages > 1 && (
          <HStack pt={4} justify="center" w="full">
            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => p - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>

            <Text fontSize="sm">
              Page {currentPage} of {totalPages}
            </Text>

            <Button
              size="sm"
              onClick={() => setCurrentPage((p) => p + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default OrdersManagement;

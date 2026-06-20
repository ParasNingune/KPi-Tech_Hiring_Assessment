import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Grid,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  Center,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { orderAPI } from '../utils/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load statistics', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  if (!stats) {
    return <Text>Failed to load stats</Text>;
  }

  return (
    <Box>
      {/* Stats Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardBody>
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber color="blue.500">{stats.total_orders}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardBody>
            <Stat>
              <StatLabel>Today's Orders</StatLabel>
              <StatNumber color="green.500">{stats.today_orders}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardBody>
            <Stat>
              <StatLabel>Today's Revenue</StatLabel>
              <StatNumber color="orange.500">${stats.today_revenue.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardBody>
            <Stat>
              <StatLabel>Popular Items</StatLabel>
              <StatNumber color="purple.500">{stats.popular_items.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Status Breakdown */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6}>
        {/* Orders by Status */}
        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardHeader>
            <Heading size="md">Orders by Status</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {Object.entries(stats.orders_by_status).map(([status, count]) => (
                <HStack key={status} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="medium">{status}</Text>
                  <Box bg="blue.500" color="white" px={3} py={1} borderRadius="full" fontWeight="bold">
                    {count}
                  </Box>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Popular Items */}
        <Card shadow="soft" border="1px solid" borderColor="blackAlpha.100">
          <CardHeader>
            <Heading size="md">Most Popular Items</Heading>
          </CardHeader>
          <Divider />
          <CardBody>
            <VStack align="stretch" spacing={3}>
              {stats.popular_items.length > 0 ? (
                stats.popular_items.map((item, idx) => (
                  <HStack key={idx} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                    <Text fontWeight="medium">{item.name}</Text>
                    <Box bg="orange.500" color="white" px={3} py={1} borderRadius="full" fontWeight="bold">
                      {item.count} sold
                    </Box>
                  </HStack>
                ))
              ) : (
                <Text color="gray.500">No data yet</Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      <Button mt={6} colorScheme="blue" onClick={loadStats}>
        Refresh Stats
      </Button>
    </Box>
  );
};

export default Dashboard;

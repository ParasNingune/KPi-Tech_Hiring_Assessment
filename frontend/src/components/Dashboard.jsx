import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
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
  Badge,
  Grid,
} from '@chakra-ui/react';
import { orderAPI } from '../utils/api';

// 1. Revenue Trend Area Chart (SVG)
const RevenueTrendChart = ({ trendData }) => {
  const width = 500;
  const height = 220;
  const paddingX = 50;
  const paddingY = 30;

  const maxVal = Math.max(...trendData.map((d) => d.value), 100);
  const cleanMaxVal = Math.ceil(maxVal / 100) * 100;

  const points = trendData.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (trendData.length - 1);
    const y = height - paddingY - (d.value / cleanMaxVal) * (height - 2 * paddingY);
    return { x, y, label: d.label, value: d.value };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">7-Day Revenue Trend</Heading>
      <Box position="relative" w="full" overflow="hidden">
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chakra-colors-brand-500)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--chakra-colors-brand-500)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid Lines & Y Axis Labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            const valLabel = Math.round(cleanMaxVal * (1 - ratio));
            return (
              <g key={index}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="var(--chakra-colors-app-border)"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
                <text
                  x={paddingX - 10}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10px"
                  fill="var(--chakra-colors-app-faintText)"
                  fontWeight="bold"
                >
                  ₹{valLabel}
                </text>
              </g>
            );
          })}

          {/* Area under the line */}
          {trendData.some((d) => d.value > 0) && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* The line itself */}
          <path
            d={linePath}
            fill="none"
            stroke="var(--chakra-colors-brand-500)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={height - 10}
              textAnchor="middle"
              fontSize="10px"
              fill="var(--chakra-colors-app-faintText)"
              fontWeight="bold"
            >
              {p.label}
            </text>
          ))}

          {/* Data Points */}
          {points.map((p, i) => (
            <g key={i} style={{ cursor: 'pointer' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="var(--chakra-colors-brand-500)"
                stroke="var(--chakra-colors-app-surface)"
                strokeWidth={2}
              />
              <title>{`${p.label}: ₹${p.value.toFixed(2)}`}</title>
            </g>
          ))}
        </svg>
      </Box>
    </Card>
  );
};

// 2. Orders by Status Chart
const OrdersByStatusChart = ({ statusBreakdown }) => {
  const entries = Object.entries(statusBreakdown);
  const total = entries.reduce((sum, [_, count]) => sum + count, 0);

  const getStatusColor = (status) => {
    const colors = {
      Placed: 'blue.500',
      Confirmed: 'cyan.500',
      Preparing: 'orange.500',
      Ready: 'green.500',
      'Picked Up': 'purple.500',
    };
    return colors[status] || 'gray.500';
  };

  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">Orders by Status</Heading>
      <VStack align="stretch" spacing={3}>
        {entries.map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <Box key={status}>
              <HStack justify="space-between" mb={1}>
                <Text fontSize="sm" fontWeight="semibold" color="app.text">{status}</Text>
                <HStack spacing={2}>
                  <Text fontSize="xs" color="app.faintText">
                    {total > 0 ? `${Math.round(percentage)}%` : '0%'}
                  </Text>
                  <Badge
                    colorScheme={
                      status === 'Picked Up' ? 'purple' :
                      status === 'Ready' ? 'green' :
                      status === 'Preparing' ? 'orange' :
                      status === 'Confirmed' ? 'cyan' : 'blue'
                    }
                    borderRadius="full"
                    px={2}
                  >
                    {count}
                  </Badge>
                </HStack>
              </HStack>
              <Box
                w="full"
                h="10px"
                bg="app.mutedSurface"
                borderRadius="full"
                overflow="hidden"
                border="1px solid"
                borderColor="app.border"
              >
                <Box
                  h="full"
                  w={`${percentage}%`}
                  bg={getStatusColor(status)}
                  borderRadius="full"
                  transition="width 0.8s ease-in-out"
                />
              </Box>
            </Box>
          );
        })}
      </VStack>
    </Card>
  );
};

// 3. Most Popular Items Chart
const PopularItemsChart = ({ popularItems }) => {
  const maxCount = Math.max(...popularItems.map((item) => item.count), 1);

  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">Most Popular Items</Heading>
      <VStack align="stretch" spacing={4}>
        {popularItems.length > 0 ? (
          popularItems.map((item, idx) => {
            const percentage = (item.count / maxCount) * 100;
            return (
              <Box key={idx}>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" fontWeight="semibold" color="app.text">{item.name}</Text>
                  <Text fontSize="sm" fontWeight="bold" color="brand.500">
                    {item.count} sold
                  </Text>
                </HStack>
                <Box
                  w="full"
                  h="12px"
                  bg="app.mutedSurface"
                  borderRadius="full"
                  overflow="hidden"
                  border="1px solid"
                  borderColor="app.border"
                >
                  <Box
                    h="full"
                    w={`${percentage}%`}
                    bgGradient="linear(to-r, brand.400, brand.600)"
                    borderRadius="full"
                    transition="width 0.8s ease-in-out"
                  />
                </Box>
              </Box>
            );
          })
        ) : (
          <Center py={8}>
            <Text color="app.faintText">No popular items data yet</Text>
          </Center>
        )}
      </VStack>
    </Card>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load dashboard data', status: 'error' });
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

  if (!stats) {
    return <Text color="app.text">Failed to load stats</Text>;
  }

  return (
    <Box>
      {/* Stats Cards Overview */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" borderRadius="2xl">
          <CardBody>
            <Stat>
              <StatLabel color="app.subtleText">Total Orders</StatLabel>
              <StatNumber color="brand.500">{stats.total_orders}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" borderRadius="2xl">
          <CardBody>
            <Stat>
              <StatLabel color="app.subtleText">Today's Orders</StatLabel>
              <StatNumber color="brand.500">{stats.today_orders}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" borderRadius="2xl">
          <CardBody>
            <Stat>
              <StatLabel color="app.subtleText">Today's Revenue</StatLabel>
              <StatNumber color="brand.500">₹{stats.today_revenue.toFixed(2)}</StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" borderRadius="2xl">
          <CardBody>
            <Stat>
              <StatLabel color="app.subtleText">Popular Items</StatLabel>
              <StatNumber color="brand.500">{stats.popular_items.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Revenue Trend Area Chart */}
      <Box mb={8}>
        <RevenueTrendChart trendData={stats.revenue_trend} />
      </Box>

      {/* Status & Popularity Breakdown Charts */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={6} mb={8}>
        <OrdersByStatusChart statusBreakdown={stats.orders_by_status} />
        <PopularItemsChart popularItems={stats.popular_items} />
      </Grid>

      <Button colorScheme="orange" onClick={loadData} borderRadius="full" shadow="sm">
        Refresh Dashboard
      </Button>
    </Box>
  );
};

export default Dashboard;

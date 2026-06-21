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
  const height = 200;
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

// 2. Orders by Status Chart (SVG Pie Chart)
const OrdersByStatusChart = ({ statusBreakdown }) => {
  const entries = Object.entries(statusBreakdown).filter(([_, count]) => count > 0);
  const total = Object.values(statusBreakdown).reduce((sum, count) => sum + count, 0);

  const getStatusColor = (status) => {
    const colors = {
      Placed: '#3182ce',      // blue.500
      Confirmed: '#00b5d8',   // cyan.500
      Preparing: '#dd6b20',   // orange.500
      Ready: '#38a169',       // green.500
      'Picked Up': '#805ad5', // purple.500
    };
    return colors[status] || '#718096';
  };

  const getStatusColorClass = (status) => {
    const colors = {
      Placed: 'blue',
      Confirmed: 'cyan',
      Preparing: 'orange',
      Ready: 'green',
      'Picked Up': 'purple',
    };
    return colors[status] || 'gray';
  };

  if (total === 0) {
    return (
      <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
        <Heading size="sm" mb={4} color="app.text">Orders by Status</Heading>
        <Center py={10}>
          <Text color="app.faintText">No order data available yet</Text>
        </Center>
      </Card>
    );
  }

  const cx = 100;
  const cy = 100;
  const r = 75;

  let accumulatedAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const slices = entries.map(([status, count]) => {
    const percentage = (count / total) * 100;
    const angle = (count / total) * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      status,
      count,
      percentage,
      pathData,
      color: getStatusColor(status),
      colorClass: getStatusColorClass(status)
    };
  });

  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">Orders by Status</Heading>
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={8} align="center" justify="center" px={2}>
        <Box w="190px" h="190px" flexShrink={0}>
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            {slices.map((slice, idx) => (
              <path
                key={idx}
                d={slice.pathData}
                fill={slice.color}
                stroke="var(--chakra-colors-app-surface)"
                strokeWidth={2}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <title>{`${slice.status}: ${slice.count} (${Math.round(slice.percentage)}%)`}</title>
              </path>
            ))}
          </svg>
        </Box>
        <VStack align="start" spacing={2.5} flex={1} w="full">
          {slices.map((slice, idx) => (
            <HStack key={idx} spacing={2} w="full" justify="space-between">
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg={slice.color} />
                <Text fontSize="sm" fontWeight="semibold" color="app.text">
                  {slice.status}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="xs" color="app.faintText">
                  {Math.round(slice.percentage)}%
                </Text>
                <Badge colorScheme={slice.colorClass} borderRadius="full" px={2}>
                  {slice.count}
                </Badge>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Stack>
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

// 4. Category Revenue Chart (Donut Chart)
const CategoryRevenueChart = ({ categoryRevenue }) => {
  const entries = categoryRevenue.filter(d => d.revenue > 0);
  const total = entries.reduce((sum, d) => sum + d.revenue, 0);

  const getCategoryColor = (category) => {
    const colors = {
      Appetizers: '#ed8936',      // orange.400
      'Main Courses': '#48bb78',  // green.400
      Desserts: '#ed64a6',       // pink.400
      Beverages: '#4299e1',      // blue.400
    };
    return colors[category] || '#a0aec0';
  };

  const getCategoryColorClass = (category) => {
    const colors = {
      Appetizers: 'orange',
      'Main Courses': 'green',
      Desserts: 'pink',
      Beverages: 'blue',
    };
    return colors[category] || 'gray';
  };

  if (total === 0) {
    return (
      <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
        <Heading size="sm" mb={4} color="app.text">Revenue by Category</Heading>
        <Center py={10}>
          <Text color="app.faintText">No category sales data available yet</Text>
        </Center>
      </Card>
    );
  }

  const cx = 100;
  const cy = 100;
  const r = 75;

  let accumulatedAngle = -Math.PI / 2;

  const slices = entries.map((d) => {
    const percentage = (d.revenue / total) * 100;
    const angle = (d.revenue / total) * 2 * Math.PI;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    return {
      category: d.category,
      revenue: d.revenue,
      percentage,
      pathData,
      color: getCategoryColor(d.category),
      colorClass: getCategoryColorClass(d.category)
    };
  });

  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">Revenue by Category</Heading>
      <Stack direction={{ base: 'column', sm: 'row' }} spacing={8} align="center" justify="center" px={2}>
        <Box w="190px" h="190px" flexShrink={0} position="relative">
          <svg viewBox="0 0 200 200" width="100%" height="100%">
            {slices.map((slice, idx) => (
              <path
                key={idx}
                d={slice.pathData}
                fill={slice.color}
                stroke="var(--chakra-colors-app-surface)"
                strokeWidth={2}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <title>{`${slice.category}: ₹${slice.revenue.toFixed(2)} (${Math.round(slice.percentage)}%)`}</title>
              </path>
            ))}
            {/* Donut Hole */}
            <circle cx={cx} cy={cy} r={40} fill="var(--chakra-colors-app-surface)" />
          </svg>
        </Box>
        <VStack align="start" spacing={2.5} flex={1} w="full">
          {slices.map((slice, idx) => (
            <HStack key={idx} spacing={2} w="full" justify="space-between">
              <HStack spacing={2}>
                <Box w={3} h={3} borderRadius="full" bg={slice.color} />
                <Text fontSize="sm" fontWeight="semibold" color="app.text">
                  {slice.category}
                </Text>
              </HStack>
              <HStack spacing={2}>
                <Text fontSize="xs" color="app.faintText">
                  {Math.round(slice.percentage)}%
                </Text>
                <Badge colorScheme={slice.colorClass} borderRadius="full" px={2}>
                  ₹{slice.revenue.toFixed(0)}
                </Badge>
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Stack>
    </Card>
  );
};

// 5. Frequently Bought Together Pairs List
const FrequentPairsList = ({ frequentPairs }) => {
  return (
    <Card shadow="soft" border="1px solid" borderColor="app.border" bg="app.surface" p={5} borderRadius="2xl">
      <Heading size="sm" mb={4} color="app.text">Frequently Bought Together Pairs</Heading>
      <VStack align="stretch" spacing={3}>
        {frequentPairs.length > 0 ? (
          frequentPairs.map((pair, idx) => (
            <HStack key={idx} justify="space-between" p={3} bg="app.mutedSurface" borderRadius="xl" border="1px solid" borderColor="app.border">
              <HStack spacing={2} wrap="wrap">
                <Badge colorScheme="orange" borderRadius="lg" px={2} py={0.5} fontSize="xs">
                  {pair.item1}
                </Badge>
                <Text fontSize="xs" fontWeight="bold" color="app.faintText">+</Text>
                <Badge colorScheme="blue" borderRadius="lg" px={2} py={0.5} fontSize="xs">
                  {pair.item2}
                </Badge>
              </HStack>
              <Badge colorScheme="green" borderRadius="full" px={2.5}>
                {pair.count} times
              </Badge>
            </HStack>
          ))
        ) : (
          <Center py={8}>
            <Text color="app.faintText">No pairing data available yet</Text>
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
      <HStack justify="space-between" align="center" mb={6}>
        <Heading size="md" color="app.text">Analytics Overview</Heading>
        <Button colorScheme="orange" onClick={loadData} borderRadius="full" shadow="sm" size="sm">
          Refresh Dashboard
        </Button>
      </HStack>

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

      {/* Charts Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '1.7fr 1.3fr' }} gap={6} mb={8} alignItems="stretch">
        <RevenueTrendChart trendData={stats.revenue_trend} />
        <OrdersByStatusChart statusBreakdown={stats.orders_by_status} />
      </Grid>

      {/* Analytics Breakdown Grid */}
      <Grid templateColumns={{ base: '1fr', lg: '1.3fr 1.7fr' }} gap={6} mb={8} alignItems="stretch">
        <CategoryRevenueChart categoryRevenue={stats.category_revenue || []} />
        <FrequentPairsList frequentPairs={stats.frequent_pairs || []} />
      </Grid>

      {/* Popularity Breakdown Chart */}
      <Box mb={8}>
        <PopularItemsChart popularItems={stats.popular_items} />
      </Box>
    </Box>
  );
};

export default Dashboard;

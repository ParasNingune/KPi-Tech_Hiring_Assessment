import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Heading,
  CloseButton,
  Avatar,
  Divider,
  Spinner,
} from '@chakra-ui/react';
import { searchAPI } from '../utils/api';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm your FoodHub Assistant. Ask me about our menu, prices, opening hours, or dietary tags! 🍔",
      time: new Date(),
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    setInputVal('');
    
    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userText,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      const response = await searchAPI.chatbot(userText);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.data.reply,
        time: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: "Sorry, I ran into an error connecting to the server. Please try again soon!",
        time: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Action Button (FAB) on bottom-right */}
      <IconButton
        position="fixed"
        bottom="24px"
        right="24px"
        zIndex="1000"
        colorScheme="orange"
        size="lg"
        borderRadius="full"
        shadow="2xl"
        icon={<span style={{ fontSize: '20px' }}>💬</span>}
        onClick={() => setIsOpen((prev) => !prev)}
        _hover={{ transform: 'scale(1.08)' }}
        transition="all 0.2s ease"
        aria-label="FAQ Chatbot"
      />

      {/* Chat Window */}
      {isOpen && (
        <Card
          position="fixed"
          bottom="24px"
          right="90px"
          w={{ base: '300px', sm: '350px' }}
          h="450px"
          bg="app.surface"
          border="1px solid"
          borderColor="app.border"
          borderRadius="2xl"
          shadow="2xl"
          zIndex="1000"
          overflow="hidden"
          display="flex"
          flexDirection="column"
        >
          {/* Header */}
          <CardHeader p={4} bgGradient="linear(to-r, orange.500, red.500)" color="white">
            <HStack justify="space-between">
              <HStack spacing={3}>
                <Avatar size="sm" name="FoodHub Assistant" src="" bg="whiteAlpha.900" color="orange.500" />
                <Box>
                  <Heading size="xs">FoodHub Assistant</Heading>
                  <Text fontSize="10px" opacity={0.85}>
                    Ask our AI questions
                  </Text>
                </Box>
              </HStack>
              <CloseButton size="sm" onClick={() => setIsOpen(false)} />
            </HStack>
          </CardHeader>

          {/* Chat Messages */}
          <CardBody
            p={4}
            flex={1}
            overflowY="auto"
            ref={scrollRef}
            bg="app.mutedSurface"
            display="flex"
            flexDirection="column"
          >
            <VStack align="stretch" spacing={3} flex={1}>
              {messages.map((msg) => (
                <Box
                  key={msg.id}
                  alignSelf={msg.sender === 'user' ? 'flex-end' : 'flex-start'}
                  maxW="80%"
                >
                  <Box
                    p={3}
                    borderRadius="2xl"
                    borderTopRightRadius={msg.sender === 'user' ? '0' : '2xl'}
                    borderTopLeftRadius={msg.sender === 'bot' ? '0' : '2xl'}
                    bg={msg.sender === 'user' ? 'brand.500' : 'app.surface'}
                    color={msg.sender === 'user' ? 'white' : 'app.text'}
                    border={msg.sender === 'bot' ? '1px solid' : 'none'}
                    borderColor="app.border"
                    shadow="sm"
                  >
                    <Text fontSize="xs">{msg.text}</Text>
                  </Box>
                  <Text
                    fontSize="9px"
                    color="app.faintText"
                    textAlign={msg.sender === 'user' ? 'right' : 'left'}
                    mt={1}
                    px={1}
                  >
                    {msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Box>
              ))}
              {loading && (
                <HStack alignSelf="flex-start" p={3} bg="app.surface" borderRadius="2xl" borderTopLeftRadius="0" border="1px solid" borderColor="app.border" shadow="sm">
                  <Spinner size="xs" color="orange.500" />
                  <Text fontSize="xs" color="app.subtleText">Typing...</Text>
                </HStack>
              )}
            </VStack>
          </CardBody>

          <Divider />

          {/* Input Area */}
          <Box p={3} bg="app.surface">
            <HStack spacing={2}>
              <Input
                placeholder="Ask a question..."
                size="sm"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyPress}
                borderRadius="xl"
                bg="app.input"
                borderColor="app.border"
              />
              <Button
                colorScheme="orange"
                size="sm"
                onClick={handleSend}
                borderRadius="xl"
                px={4}
              >
                Send
              </Button>
            </HStack>
          </Box>
        </Card>
      )}
    </>
  );
};

export default Chatbot;

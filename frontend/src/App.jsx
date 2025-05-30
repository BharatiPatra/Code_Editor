import { useState } from "react";
import { Box, Text, useColorModeValue } from "@chakra-ui/react";

import CodeEditor from "./components/CodeEditor";

function App() {
  const [theme, setTheme] = useState("vs-dark");
  const toggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "vs-light" : "vs-dark"));
  };

  const bgColor = theme === "vs-dark" ? "#0f0a19" : useColorModeValue("gray.100", "gray.800");
  const textColor = theme === "vs-dark" ? "gray.300" : useColorModeValue("gray.800", "white");

  return (
    <Box
      bg={bgColor}
      color={textColor}
      minH="90vh"
      px={6}
      py={2}
      transition="all 0.3s ease"
    >
      <Text mb={2} fontSize="3xl" fontWeight="bold" textAlign="center">
        AI Powered Collaborative Python Editor
      </Text>

      <CodeEditor theme={theme} toggleTheme={toggleTheme} />
    </Box>
  );
}

export default App;

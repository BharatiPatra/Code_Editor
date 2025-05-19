import { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";

import CodeEditor from "./components/CodeEditor";

function App() {
  const [theme, setTheme] = useState("vs-dark");
  // const navigate = useNavigate();
  // const createRoom = () => {
  //   const roomId = uuidv4();
  //   navigate(`/${roomId}`);
  // };
  // useEffect(() => {
  //   createRoom();
  // }, []);
  const toggleTheme = () => {
    setTheme((prev) => (prev === "vs-dark" ? "vs-light" : "vs-dark"));
  };

  return (
    <Box
      bg={theme === "vs-dark" ? "#0f0a19" : "gray.100"}
      color={theme === "vs-dark" ? "gray.300" : "black"}
      px={6}
      py={2}
    >
      <Text mb={2} fontSize="3xl" textAlign="center" >
        AI Powered Collaborative Python Editor
      </Text>
      <CodeEditor theme={theme} toggleTheme={toggleTheme} />
    </Box>
  );
}

export default App;

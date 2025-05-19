import { useState, useRef, useEffect } from "react";
import { Box, Button, Text, Tooltip, IconButton } from "@chakra-ui/react";
import { FiMoon, FiSun, FiRefreshCw } from "react-icons/fi"; // added FiRefreshCw

const Output = ({ editorRef, language, theme, toggleTheme }) => {
  const outputRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [pyodide, setPyodide] = useState(null);

  useEffect(() => {
    const loadPyodide = async () => {
      const pyodideModule = await window.loadPyodide();
      await pyodideModule.loadPackage(["matplotlib", "numpy", "pandas"]);
      setPyodide(pyodideModule);
    };

    loadPyodide();
  }, []);

  const runCode = async () => {
    document
      .querySelectorAll("div[id^='matplotlib_']")
      .forEach((el) => el.remove());

    const monacoDiv = document.querySelector(".monaco-aria-container");
    if (monacoDiv) {
      let nextSibling = monacoDiv.nextElementSibling;
      while (nextSibling) {
        const toRemove = nextSibling;
        nextSibling = nextSibling.nextElementSibling;
        toRemove.remove();
      }
    }

    const sourceCode = editorRef.current?.getValue();
    if (!sourceCode) return;
    if (!pyodide) return;

    setIsLoading(true);
    setIsError(false);

    try {
      let output = "";
      pyodide.setStdout({ batched: (s) => (output += s + "\n") });
      pyodide.setStderr({ batched: (s) => (output += s + "\n") });

      await pyodide.runPythonAsync(sourceCode);

      outputRef.current.innerHTML = output;
      setIsLoading(false);
      setIsError(false);
    } catch (err) {
      outputRef.current.innerHTML = err.toString();
      canvasRef.current.innerHTML = "";
      setIsLoading(false);
      setIsError(true);
    } finally {
      pyodide.setStdout({});
      pyodide.setStderr({});
    }
  };

  // Reset output & canvas
  const resetOutput = () => {
    if (outputRef.current) outputRef.current.innerHTML = "";
    if (canvasRef.current) canvasRef.current.innerHTML = "";
    setIsError(false);
    setIsLoading(false);
  };

  useEffect(() => {
    if (language !== "python") {
      resetOutput();
    }
  }, [language]);

  const isDark = theme === "vs-dark";

  return (
    <Box w="50%">
      
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={12}
      >
        <Box>
          <Button
            variant="outline"
            colorScheme="green"
            mr={2}
            mb={-16}
            isLoading={isLoading}
            onClick={runCode}
          >
            Run Code
          </Button>

          {/* Reset Button */}
          <Tooltip label="Reset Output" hasArrow>
            <IconButton
              icon={<FiRefreshCw />}
              onClick={resetOutput}
              aria-label="Reset Output"
              mb={-16}
              mr={2}
            />
          </Tooltip>
        </Box>

        <Tooltip
          label={
            theme === "vs-dark" ? "Switch to Light Mode" : "Switch to Dark Mode"
          }
          hasArrow
        >
          <IconButton
            icon={theme === "vs-dark" ? <FiSun /> : <FiMoon />}
            onClick={toggleTheme}
            colorScheme="blue"
            aria-label="Toggle Theme"
            mb={4}
          />
        </Tooltip>
      </Box>

      <Box
        height="auto"
        maxHeight="75vh"
        overflowY="auto"
        p={2}
        color={isError ? "red.400" : isDark ? "whiteAlpha.800" : "gray.800"}
        bg={isDark ? "#1e1e1e" : "gray.100"}
        border="1px solid"
        borderRadius={4}
        borderColor={isError ? "red.500" : isDark ? "gray.600" : "gray.300"}
        whiteSpace="pre-wrap"
        fontSize="md"
        id="output"
        ref={outputRef}
        minH="60vh"
      ></Box>

      <Text ml={-10} mt={4} fontSize="4xl">
        Plot
      </Text>
      {/* You can render your canvas or matplotlib output here */}
      <Box ref={canvasRef}></Box>
    </Box>
  );
};

export default Output;

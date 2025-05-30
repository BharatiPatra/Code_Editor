import { useState, useRef, useEffect } from "react";
import {
  Box,
  Button,
  Text,
  Tooltip,
  IconButton,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { FiMoon, FiSun, FiRefreshCw, FiFolder } from "react-icons/fi";

const Output = ({ editorRef, language, theme, toggleTheme }) => {
  const outputRef = useRef(null);
  const canvasRef = useRef(null);
  const [pyodide, setPyodide] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [inputPrompt, setInputPrompt] = useState("");
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputCallback, setInputCallback] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const loadPyodideEnv = async () => {
      window.get_input_from_react = async (prompt) => {
        return new Promise((resolve) => {
          setInputPrompt(prompt || "Enter input:");
          setInputVisible(true);
          setInputValue("");
          setInputCallback(() => resolve);
        });
      };

      try {
        const pyodideModule = await window.loadPyodide();

        await pyodideModule.loadPackage(["matplotlib", "numpy", "pandas"]);

        await pyodideModule.runPythonAsync(`
import builtins
import js
import asyncio

async def async_input(prompt=''):
  result = await js.get_input_from_react(prompt)
  return result

builtins.input = async_input
        `);

        setPyodide(pyodideModule);
      } catch (err) {
        console.error("Pyodide load error:", err);
        toast({
          title: "Failed to load Pyodide.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    loadPyodideEnv();
  }, []);

  const runCode = async () => {
    let code = editorRef.current?.getValue();
    if (!code || !pyodide) return;

    resetOutput();
    setIsLoading(true);

    try {
      let output = "";

      pyodide.setStdout({
        batched: (text) => {
          output += text;
          if (outputRef.current) outputRef.current.innerHTML = output;
        },
      });

      pyodide.setStderr({
        batched: (text) => {
          output += text;
          if (outputRef.current) outputRef.current.innerHTML = output;
        },
      });

      // ✅ Replace input(...) → await input(...)
      const transformedCode = code.replace(
        /(?<!await\s)(?<!\w)(input\s*\()/g,
        "await $1"
      );

      // ✅ Wrap into async def block
      const indentedCode = transformedCode
        .split("\n")
        .map((line) => "    " + line)
        .join("\n");

      const finalCode = `
async def __main__():
${indentedCode}

await __main__()`;

      await pyodide.runPythonAsync(finalCode);
    } catch (err) {
      setIsError(true);
      if (outputRef.current) {
        outputRef.current.innerHTML = err.toString();
      }
    } finally {
      setIsLoading(false);
      pyodide.setStdout({});
      pyodide.setStderr({});
    }
  };

  const submitInput = () => {
    if (inputCallback) {
      inputCallback(inputValue);
      setInputCallback(null);
    }
    setInputVisible(false);
    setInputValue("");
    setInputPrompt("");
  };

  const resetOutput = () => {
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
    if (outputRef.current) outputRef.current.innerHTML = "";
    if (canvasRef.current) canvasRef.current.innerHTML = "";
    setIsError(false);
    setIsLoading(false);
    setInputVisible(false);
    setInputValue("");
    setInputPrompt("");
  };

  useEffect(() => {
    if (language !== "python") resetOutput();
  }, [language]);

  const isDark = theme === "vs-dark";

  return (
    <Box w="50%" mt={12}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Box>
          <Button
            variant="outline"
            colorScheme="green"
            mr={2}
            isLoading={isLoading}
            loadingText="Running..."
            onClick={runCode}
            disabled={!pyodide}
          >
            {!pyodide ? "Loading Pyodide..." : "Run Code"}
          </Button>

          <Tooltip label="Open file from disk" hasArrow>
            <Box as="label">
              <input
                type="file"
                accept=".py,.txt" // or any extensions you want
                style={{ display: "none" }}
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const data = await file.text();
                    pyodide.FS.writeFile(file.name, data);
                    toast({
                      title: "File loaded to Pyodide FS.",
                      description: `File '${file.name}' successfully loaded.`,
                      status: "success",
                      duration: 3000,
                      isClosable: true,
                    });
                  }
                }}
              />
              <IconButton
                as="span"
                icon={<FiFolder />}
                aria-label="Open Folder"
                variant="outline"
                mr={2}
              />
            </Box>
          </Tooltip>
          <Tooltip label="Reset Output" hasArrow>
            <IconButton
              icon={<FiRefreshCw />}
              onClick={resetOutput}
              aria-label="Reset Output"
              mr={2}
            />
          </Tooltip>
        </Box>
        <Tooltip label={isDark ? "Light Mode" : "Dark Mode"} hasArrow>
          <IconButton
            icon={isDark ? <FiSun /> : <FiMoon />}
            onClick={toggleTheme}
            colorScheme="blue"
            aria-label="Toggle Theme"
          />
        </Tooltip>
      </Box>

      <Box
        ref={outputRef}
        minH="50vh"
        maxHeight="75vh"
        overflowY="auto"
        p={2}
        whiteSpace="pre-wrap"
        fontSize="md"
        bg={isDark ? "#1e1e1e" : "gray.100"}
        color={isError ? "red.400" : isDark ? "whiteAlpha.800" : "gray.800"}
        border="1px solid"
        borderColor={isError ? "red.500" : isDark ? "gray.600" : "gray.300"}
        borderRadius={4}
      >
        {!pyodide && "Loading Pyodide..."}
      </Box>

      {inputVisible && (
        <VStack mt={4} align="stretch" spacing={2}>
          <Text>{inputPrompt}</Text>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitInput();
            }}
            placeholder="Type input and press Enter"
          />
        </VStack>
      )}

      <Box ref={canvasRef}></Box>
    </Box>
  );
};

export default Output;

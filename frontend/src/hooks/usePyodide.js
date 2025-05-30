// hooks/usePyodide.js
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";

const usePyodide = () => {
  const [pyodide, setPyodide] = useState(null);
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

  const submitInput = () => {
    if (inputCallback) {
      inputCallback(inputValue);
      setInputCallback(null);
    }
    setInputVisible(false);
    setInputValue("");
    setInputPrompt("");
  };

  return {
    pyodide,
    inputPrompt,
    inputVisible,
    inputValue,
    setInputValue,
    submitInput,
  };
};

export default usePyodide;

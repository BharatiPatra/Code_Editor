import { useRef, useState } from "react";
import {
  Box,
  HStack,
  Button,
  Tabs,
  TabList,
  Tab,
  CloseButton,
  Flex,
  Text,
  Input,
} from "@chakra-ui/react";
import { Editor, useMonaco } from "@monaco-editor/react";
import { registerCompletion } from "monacopilot";
import FileSelector from "./FileSelector";
import { CODE_SNIPPETS } from "../constants";
import Output from "./Output";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_APP_API_URL;

const CodeEditor = ({ theme, toggleTheme }) => {
  const socketRef = useRef(null);
  const { roomId } = useParams();

  const monaco = useMonaco();
  const completionRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [tempFileName, setTempFileName] = useState("");
  const editorRef = useRef();

  const [files, setFiles] = useState([
    {
      name: "file1.py",
      content: editorRef.current?.getValue() || CODE_SNIPPETS["python"],
      language: "python",
    },
  ]);

  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const activeFile = files[activeFileIndex];
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(API_URL);

      socketRef.current.on("connect", () => {
        console.log("Socket connected:", socketRef.current.id);
        if (roomId) {
          socketRef.current.emit("join-room", roomId);
        }
      });

      socketRef.current.on("connect_error", (err) => {
        console.error("Socket connection error:", err.message, err.data);
      });

      socketRef.current.on("disconnect", () => {
        console.log("Socket disconnected");
      });
    } else {
      if (roomId) {
        socketRef.current.emit("join-room", roomId);
      }
    }

    return () => {
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [roomId]);

  useEffect(() => {
    const receiveCode = (newCode) => {
      setFiles([
        {
          name: "file1.py",
          content: newCode || CODE_SNIPPETS["python"],
          language: "python",
        },
      ]);
    };

    socketRef.current?.on("receive-code", receiveCode);

    return () => {
      socketRef.current?.off("receive-code", receiveCode);
    };
  }, [activeFileIndex]); // ✅ No dependencies

  const handleResetClick = () => {
    editorRef.current.setValue("");
  };
  const startEditing = (index) => {
    setEditingIndex(index);
    setTempFileName(files[index].name);
  };

  const finishEditing = () => {
    if (tempFileName.trim() === "") {
      // Don't allow empty name
      setTempFileName(files[editingIndex].name);
    } else {
      const updatedFiles = [...files];
      updatedFiles[editingIndex].name = tempFileName.trim();
      setFiles(updatedFiles);
    }
    setEditingIndex(null);
  };

  const handleEditorMount = (editor, monacoInstance) => {
    editorRef.current = editor;
    editor.focus();
    const codeCompletionUrl = `${API_URL}/code-completion`;
    completionRef.current = registerCompletion(
      monacoInstance,
      editorRef.current,
      {
        endpoint: codeCompletionUrl,
        language: activeFile.language,
      }
    );
  };

  const handleAddFile = () => {
    const newFileIndex = files.length + 1;
    const newFile = {
      name: `file${newFileIndex}.py`,
      content: "",
      language: "python",
    };
    setFiles([...files, newFile]);
    setActiveFileIndex(files.length);
  };

  const handleFileChange = (val) => {
    console.log("Emitting code-change to room:", roomId, val);
    socketRef.current?.emit("code-change", { roomId, code: val });

    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles[activeFileIndex].content = val;
      return updatedFiles;
    });
  };

  const handleTabClose = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    if (index === activeFileIndex) {
      setActiveFileIndex(index > 0 ? index - 1 : 0);
    } else if (index < activeFileIndex) {
      setActiveFileIndex((prev) => prev - 1);
    }
  };

  return (
    <Box>
      <HStack spacing={4} align="start">
        <Box w="50%">
          <FileSelector
            language={activeFile.language}
            onFolderClick={(fileContent, fileName) => {
              const updatedFiles = [...files];
              updatedFiles[activeFileIndex] = {
                ...updatedFiles[activeFileIndex],
                name: fileName,
                content: fileContent,
                language: "python",
              };
              setFiles(updatedFiles);
            }}
            onResetClick={handleResetClick}
            activeFile={activeFile.content}
            activeFileName={activeFile.name}
            roomId={roomId}
          />

          <Flex justify="space-between" align="center" mb={2}>
            <Tabs
              index={activeFileIndex}
              onChange={setActiveFileIndex}
              variant="soft-rounded"
              colorScheme="teal"
            >
              <TabList>
                {files.map((file, index) => (
                  <Tab key={index}>
                    <HStack spacing={1}>
                      {editingIndex === index ? (
                        <Input
                          size="xs"
                          value={tempFileName}
                          autoFocus
                          onChange={(e) => setTempFileName(e.target.value)}
                          onBlur={finishEditing}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") finishEditing();
                            if (e.key === "Escape") setEditingIndex(null);
                          }}
                        />
                      ) : (
                        <Text
                          onDoubleClick={() => startEditing(index)}
                          cursor="pointer"
                          userSelect="none"
                        >
                          {file.name}
                        </Text>
                      )}
                      {files.length > 1 && (
                        <CloseButton
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTabClose(index);
                          }}
                        />
                      )}
                    </HStack>
                  </Tab>
                ))}
                <Button size="sm" onClick={handleAddFile} ml={2}>
                  +
                </Button>
              </TabList>
            </Tabs>
          </Flex>

          <Editor
            options={{ minimap: { enabled: false } }}
            height="60vh"
            language={activeFile.language}
            value={activeFile.content}
            theme={theme}
            onMount={handleEditorMount}
            onChange={handleFileChange}
          />
          <Text fontSize="xl" color="blue.500" fontWeight="bold">
            Plot{" "}
          </Text>
        </Box>

        <Output
          editorRef={editorRef}
          language={activeFile.language}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </HStack>
    </Box>
  );
};

export default CodeEditor;

import React, { useRef, useState } from "react";
import { Tooltip } from "@chakra-ui/react";
import ShareCodeModal from "./ShareCodeModal"; // Make sure path is correct
import {
  Box,
  Button,
  Text,
  IconButton,
  HStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  RadioGroup,
  Radio,
  Stack,
  useToast,
} from "@chakra-ui/react";
import { FiFolder, FiDownload, FiRefreshCw, FiShare2 } from "react-icons/fi";

const FileSelector = ({
  onFolderClick,
  onResetClick,
  activeFile,
  activeFileName,
  roomId,
}) => {
  const fileInputRef = useRef();
  const toast = useToast();

  const {
    isOpen: isDownloadOpen,
    onOpen: onDownloadOpen,
    onClose: onDownloadClose,
  } = useDisclosure();

  const {
    isOpen: isShareOpen,
    onOpen: onShareOpen,
    onClose: onShareClose,
  } = useDisclosure();

  const [downloadOption, setDownloadOption] = useState("single");
  const [downloadFileName, setDownloadFileName] = useState(
    activeFileName || "code.py"
  );

  React.useEffect(() => {
    setDownloadFileName(activeFileName || "code.py");
  }, [activeFileName]);

  const handleFolderIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".py")) {
      toast({
        title: "Invalid File Type",
        description: "Please select a Python (.py) file.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      onFolderClick(e.target.result, file.name);
      toast({
        title: "File Loaded",
        description: `${file.name} loaded successfully.`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Could not read the selected file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    };
    reader.readAsText(file);
    event.target.value = null;
  };

  const handleDownload = () => {
    const currentCode =
      activeFile?.content || "# No active file content to download";
    const blob = new Blob([currentCode], {
      type: "text/x-python",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = downloadFileName.endsWith(".py")
      ? downloadFileName
      : `${downloadFileName}.py`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    onDownloadClose();
    toast({
      title: "Download Started",
      description: `${link.download} is being saved.`,
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const generateShareLinkViaWebSocket = async (
    codeToShare,
    expiryPreference
  ) => {
    const encodedCode = btoa(unescape(encodeURIComponent(codeToShare))); // Encode the code
    const shareableUrl = `${window.location.origin}/${roomId}?data=${encodedCode}&expiry=${expiryPreference}`;
    return shareableUrl; // Return the generated URL
  };

  return (
    <Box ml={2} mb={4}>
      <HStack spacing={2}>
        <Tooltip label="Open file from disk" hasArrow>
          <IconButton
            icon={<FiFolder />}
            aria-label="Open Folder"
            variant="outline"
            onClick={handleFolderIconClick}
          />
        </Tooltip>

        <input
          type="file"
          accept=".py"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <Tooltip label="Save current file to disk" hasArrow>
          <IconButton
            icon={<FiDownload />}
            aria-label="Download File"
            variant="outline"
            onClick={onDownloadOpen}
          />
        </Tooltip>
        <Tooltip label="Reset Editor Content" hasArrow>
          <IconButton
            icon={<FiRefreshCw />}
            aria-label="Reset Editor"
            variant="outline"
            onClick={() => {
              onResetClick();
              toast({ title: "Editor Reset", status: "info", duration: 1500 });
            }}
          />
        </Tooltip>
        <Tooltip label="Share Code via Link" hasArrow>
          <IconButton
            icon={<FiShare2 />}
            onClick={onShareOpen}
            variant="outline"
            aria-label="Share Code"
          />
        </Tooltip>

        <ShareCodeModal
          isOpen={isShareOpen}
          onClose={onShareClose}
          code={activeFile?.content || ""}
          onGenerateShareLink={generateShareLinkViaWebSocket}
        />
      </HStack>

      <Modal isOpen={isDownloadOpen} onClose={onDownloadClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Code</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>
              Choose download option (currently only current file):
            </Text>
            <RadioGroup onChange={setDownloadOption} value={downloadOption}>
              <Stack direction="column">
                <Radio value="single">Save current file only</Radio>
              </Stack>
            </RadioGroup>
            <Text mt={4} mb={1}>
              File Name:
            </Text>
            <Input
              value={downloadFileName}
              onChange={(e) => setDownloadFileName(e.target.value)}
              placeholder="Enter file name (e.g., script.py)"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={onDownloadClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" ml={3} onClick={handleDownload}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FileSelector;

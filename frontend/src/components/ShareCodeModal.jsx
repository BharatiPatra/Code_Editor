import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Select,
  Input,
  useToast,
  Text,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { FiCopy, FiShare2 as FiWhatsApp } from "react-icons/fi";

const ShareCodeModal = ({ isOpen, onClose, code, onGenerateShareLink }) => {
  const [expiry, setExpiry] = useState("6m");
  const [shareURL, setShareURL] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleGenerateLink = async () => {
    setIsLoading(true);
    setShareURL("");

    try {
      const url = await onGenerateShareLink(code, expiry);
      if (!url || typeof url !== "string") throw new Error("Invalid URL returned");

      setShareURL(url);
      toast({
        title: "Share Link Ready!",
        description: "Your shareable link has been generated.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error Generating Link",
        description: error.message || "An error occurred while generating the link.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!shareURL) return;
    navigator.clipboard.writeText(shareURL);
    toast({
      title: "Link copied!",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleWhatsAppShare = () => {
    if (!shareURL) return;
    const message = `Check out this code snippet: ${shareURL}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
  };

  const handleModalClose = () => {
    setShareURL("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleModalClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Share this Code</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {isLoading ? (
            <VStack spacing={4} align="center" justify="center" minH="150px">
              <Spinner size="xl" />
              <Text>Generating your shareable link...</Text>
            </VStack>
          ) : !shareURL ? (
            <VStack spacing={4} align="stretch">
              <Text>
                Select an expiry period for the shareable link (if your WebSocket setup supports it):
              </Text>
              <Select value={expiry} onChange={(e) => setExpiry(e.target.value)}>
                <option value="1h">1 Hour</option>
                <option value="1d">1 Day</option>
                <option value="7d">1 Week</option>
                <option value="1m">1 Month</option>
                <option value="6m">6 Months</option>
                <option value="never">Never (if supported)</option>
              </Select>
            </VStack>
          ) : (
            <VStack spacing={4} align="stretch">
              <Text>Your shareable link is ready:</Text>
              <Input value={shareURL} isReadOnly placeholder="Shareable URL" />
              <Button leftIcon={<FiCopy />} onClick={handleCopy} colorScheme="teal">
                Copy Link
              </Button>
              <Button leftIcon={<FiWhatsApp />} onClick={handleWhatsAppShare} colorScheme="whatsapp">
                Share on WhatsApp
              </Button>
              <Text fontSize="sm">
                Anyone with this link will be able to view the code (or join the session, depending on your setup).
              </Text>
            </VStack>
          )}
        </ModalBody>
        <ModalFooter>
          {!shareURL && !isLoading && (
            <Button colorScheme="blue" onClick={handleGenerateLink}>
              Generate Link
            </Button>
          )}
          <Button variant="ghost" onClick={handleModalClose} ml={3}>
            {shareURL || isLoading ? "Close" : "Cancel"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareCodeModal;

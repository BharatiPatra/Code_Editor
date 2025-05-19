require("dotenv").config();

const cors = require("cors");
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const { CompletionCopilot } = require("monacopilot");

const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const roomCodeMap = {}; // { roomId: codeString }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined room ${roomId}`);

    // Send the last saved code for this room
    const existingCode = roomCodeMap[roomId] || "";
    socket.emit("receive-code", existingCode);
  });

  socket.on("code-change", ({ roomId, code }) => {
    roomCodeMap[roomId] = code; // Save latest code for room
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


const copilot = new CompletionCopilot(process.env.MISTRAL_API_KEY, {
  provider: "mistral",
  model: "codestral",
});

app.post("/code-completion", async (req, res) => {
  try {
    console.log("Incoming body:", req.body);
    const completion = await copilot.complete({ body: req.body });
    res.json(completion);
  } catch (error) {
    console.error("Completion error:", error);
    res.status(500).json({ error: "Completion failed", details: error.message });
  }
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server is running on port ${process.env.PORT || 3000}`);
});

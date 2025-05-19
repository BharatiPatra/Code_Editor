import { useState, useEffect } from "react";

import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const createRoom = () => {
    const roomId = uuidv4();
    navigate(`/${roomId}`);
  };
  useEffect(() => {
    createRoom();
  }, []);

  return <div>Redirecting to your room...</div>;
}

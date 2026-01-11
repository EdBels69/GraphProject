
import { io } from "socket.io-client";

const socket = io("http://localhost:3002");

console.log("Connecting to WebSocket server...");

socket.on("connect", () => {
    console.log("Connected to server via WebSocket!", socket.id);

    // Join a room (dummy job ID)
    socket.emit("join_job", "test-job-123");
    console.log("Joined job room: 'test-job-123'");
});

socket.on("job_progress", (data) => {
    console.log("Received progress update:", data);
});

socket.on("disconnect", () => {
    console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
    console.error("Connection error:", err.message);
    process.exit(1);
});

// Keep alive for a bit to listen
setTimeout(() => {
    console.log("Test finished listening.");
    process.exit(0);
}, 5000);

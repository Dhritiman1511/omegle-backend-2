module.exports = (io, redisClient) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Handle user joining the queue
    socket.on("join", async () => {
      try {
        // Set a timeout for waiting
        const timeout = setTimeout(async () => {
          // Notify the user they are waiting too long
          socket.emit("timeout", "No match found. Please try again later.");

          // Remove user from the waiting queue
          await redisClient.lrem("waitingUsers", 0, socket.id);
        }, 30000); // 30 seconds

        // Matchmaking logic
        const waitingUser = await redisClient.lpop("waitingUsers");
        if (waitingUser) {
          clearTimeout(timeout); // Cancel timeout on match
          socket.emit("paired", waitingUser);
          io.to(waitingUser).emit("paired", socket.id);

          // Save pairing in Redis
          await redisClient.set(`paired:${socket.id}`, waitingUser);
          await redisClient.set(`paired:${waitingUser}`, socket.id);
        } else {
          await redisClient.rpush("waitingUsers", socket.id);
        }
      } catch (error) {
        console.error("Error handling join event:", error);
      }
    });

    // Handle WebRTC signaling
    socket.on("signal", (data) => {
      io.to(data.to).emit("signal", data);
    });

    // Handle user disconnection
    socket.on("disconnect", async () => {
      try {
        // Notify the paired user about disconnection
        const pairedUser = await redisClient.get(`paired:${socket.id}`);
        if (pairedUser) {
          io.to(pairedUser).emit("partner-disconnected");
          await redisClient.del(`paired:${socket.id}`);
          await redisClient.del(`paired:${pairedUser}`);
        }

        // Remove from waiting queue if applicable
        await redisClient.lrem("waitingUsers", 0, socket.id);
        console.log(`User disconnected: ${socket.id}`);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });
};
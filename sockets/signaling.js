module.exports = (io, redisClient) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const sanitizedId = sanitizeInput(socket.id);

    socket.on("join", async () => {
      try {
        const timeout = setTimeout(async () => {
          socket.emit("timeout", "No match found. Please try again later.");
          await redisClient.lrem("waitingUsers", 0, sanitizedId);
        }, 30000);

        const waitingUser = await redisClient.lpop("waitingUsers");
        if (waitingUser) {
          const sanitizedWaitingUser = sanitizeInput(waitingUser);
          clearTimeout(timeout);
          socket.emit("paired", sanitizedWaitingUser);
          io.to(sanitizedWaitingUser).emit("paired", sanitizedId);

          await redisClient.set(`paired:${sanitizedId}`, sanitizedWaitingUser);
          await redisClient.set(`paired:${sanitizedWaitingUser}`, sanitizedId);
        } else {
          await redisClient.rpush("waitingUsers", sanitizedId);
        }
      } catch (error) {
        console.error("Error handling join event:", error);
      }
    });

    socket.on("disconnect", async () => {
      try {
        const pairedUser = await redisClient.get(`paired:${sanitizedId}`);
        if (pairedUser) {
          const sanitizedPairedUser = sanitizeInput(pairedUser);
          io.to(sanitizedPairedUser).emit("partner-disconnected");
          await redisClient.del(`paired:${sanitizedId}`);
          await redisClient.del(`paired:${sanitizedPairedUser}`);
        }
        await redisClient.lrem("waitingUsers", 0, sanitizedId);
        console.log(`User disconnected: ${sanitizedId}`);
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });

    socket.on("signal", (data) => {
      const sanitizedData = {
        ...data,
        to: sanitizeInput(data.to),
      };
      io.to(sanitizedData.to).emit("signal", sanitizedData);
    });
  });
};
const EventEmitter = require("events");
const notificationEmitter = new EventEmitter();

// In-memory array of active clients
let clients = [];

function registerClient(res) {
  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  // Keep connection alive with 15s heartbeats
  const heartbeat = setInterval(() => {
    res.write("data: {\"type\":\"ping\"}\n\n");
  }, 15000);

  console.log(`[SSE] Client connected. Active clients: ${clients.length}`);

  return () => {
    clearInterval(heartbeat);
    clients = clients.filter(c => c.id !== clientId);
    console.log(`[SSE] Client disconnected. Active clients: ${clients.length}`);
  };
}

function broadcast(eventData) {
  const payload = JSON.stringify({
    ...eventData,
    timestamp: new Date().toISOString()
  });

  clients.forEach(client => {
    client.res.write(`data: ${payload}\n\n`);
  });
}

module.exports = {
  registerClient,
  broadcast,
  emitter: notificationEmitter
};

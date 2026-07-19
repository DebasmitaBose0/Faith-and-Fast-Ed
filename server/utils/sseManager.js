let clients = [];

export const addClient = (res) => {
  clients.push(res);
  
  res.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
};

export const broadcastNotification = (event, data) => {
  clients.forEach((client) => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
};

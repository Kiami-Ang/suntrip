const ONLINE_THRESHOLD_MS = 5 * 60 * 1000;
const onlineMap = new Map();

const setUserOnline = (userId, data) => {
  onlineMap.set(userId, { ...data, lastSeen: Date.now() });
};

const setUserOffline = (userId) => {
  onlineMap.delete(userId);
};

const getOnlineUsers = () => {
  const now = Date.now();
  const users = [];
  for (const [id, data] of onlineMap.entries()) {
    if (now - data.lastSeen < ONLINE_THRESHOLD_MS) {
      users.push({ id, ...data });
    } else {
      onlineMap.delete(id);
    }
  }
  return users;
};

module.exports = { setUserOnline, setUserOffline, getOnlineUsers, onlineMap };

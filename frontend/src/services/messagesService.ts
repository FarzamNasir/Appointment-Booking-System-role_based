const API_URL = "http://localhost:8000";

export const messagesService = {
  async getAll() {
    const res = await fetch(`${API_URL}/messages/`);
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
  },

  async create(message) {
    console.log("Message being sent to /messages/", message);
    const res = await fetch(`${API_URL}/messages/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    if (!res.ok) throw new Error("Failed to create message");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update message");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/messages/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete message");
    return res.json();
  },
}; 
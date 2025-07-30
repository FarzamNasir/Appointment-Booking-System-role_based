const API_URL = "http://localhost:8000";

export const timeSlotsService = {
  async getAll() {
    const res = await fetch(`${API_URL}/availabilities/`);
    if (!res.ok) throw new Error("Failed to fetch time slots");
    return res.json();
  },

  async create(slot) {
    const res = await fetch(`${API_URL}/availabilities/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slot),
    });
    if (!res.ok) throw new Error("Failed to create time slot");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/availabilities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update time slot");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/availabilities/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete time slot");
    return res.json();
  },
}; 
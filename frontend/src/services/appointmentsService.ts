const API_URL = "http://localhost:8000";

export const appointmentsService = {
  async getAll() {
    const res = await fetch(`${API_URL}/appointments/`);
    if (!res.ok) throw new Error("Failed to fetch appointments");
    return res.json();
  },

  async create(appointment) {
    const res = await fetch(`${API_URL}/appointments/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(appointment),
    });
    if (!res.ok) throw new Error("Failed to create appointment");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update appointment");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/appointments/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete appointment");
    return res.json();
  },
}; 
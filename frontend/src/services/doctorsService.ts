const API_URL = "http://localhost:8000";

export const doctorsService = {
  async getAll() {
    const res = await fetch(`${API_URL}/doctors/`);
    if (!res.ok) throw new Error("Failed to fetch doctors");
    return res.json();
  },

  async create(doctor) {
    const res = await fetch(`${API_URL}/doctors/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(doctor),
    });
    if (!res.ok) throw new Error("Failed to create doctor");
    return res.json();
  },

  async update(id, updates) {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update doctor");
    return res.json();
  },

  async delete(id) {
    const res = await fetch(`${API_URL}/doctors/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete doctor");
    return res.json();
  },
}; 
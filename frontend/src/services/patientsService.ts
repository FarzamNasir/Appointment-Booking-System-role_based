import { Patient } from "@/contexts/DataContext";


const API_URL = "http://localhost:8000";
function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    const res = await fetch(`${API_URL}/patients/`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    if (!res.ok) throw new Error("Failed to fetch patients");
    return res.json();
  },

  async create(patient: Omit<Patient, "id">): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(patient),
    });
    if (!res.ok) throw new Error("Failed to create patient");
    return res.json();
  },

  async update(id: string, updates: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Failed to update patient");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete patient");
    // DELETE usually returns 204, no JSON to parse
  },
};

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { patientsService } from '@/services/patientsService';
import { doctorsService } from '@/services/doctorsService';
import { timeSlotsService } from '@/services/timeSlotsService';
import { appointmentsService } from '@/services/appointmentsService';
import { voiceNotesService } from '@/services/voiceNotesService';
import { messagesService } from '@/services/messagesService';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  condition: string;
  status: 'Active' | 'Inactive' | 'Critical';
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  location: string;
  contact: string;
  experience: number;
  rating: number;
  availability: 'Available' | 'Busy' | 'Offline';
  description?: string;
}

export interface TimeSlot {
  id: string;
  doctorId: string;
  doctorName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'Available' | 'Booked' | 'Blocked';
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';
  type: string;
  notes?: string;
}

export interface VoiceNote {
  id: string;
  name: string;
  duration: string;
  uploadedAt: Date;
  transcription: string;
  status: 'Processing' | 'Completed' | 'Error';
  aiAnalysis?: {
    symptoms: string[];
    urgency: 'Low' | 'Medium' | 'High';
    recommendedSpecialty: string;
  };
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  doctorRecommendation?: {
    name: string;
    specialty: string;
    location: string;
    rating: number;
    availability: string;
  };
  doctorRecommendations?: {
    id: string;
    name: string;
    specialization: string;
    location: string;
    contact: string;
    experience: number;
    rating: number;
    availability: string;
    description: string;
  }[];
}

interface DataContextType {
  patients: Patient[];
  doctors: Doctor[];
  timeSlots: TimeSlot[];
  appointments: Appointment[];
  voiceNotes: VoiceNote[];
  messages: Message[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<void>;
  updatePatient: (id: string, patient: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<void>;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => Promise<void>;
  deleteDoctor: (id: string) => Promise<void>;
  addTimeSlot: (slot: Omit<TimeSlot, 'id'>) => Promise<void>;
  deleteTimeSlot: (id: string) => Promise<void>;
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  addVoiceNote: (note: Omit<VoiceNote, 'id'>) => Promise<void>;
  updateVoiceNote: (id: string, note: Partial<VoiceNote>) => Promise<void>;
  deleteVoiceNote: (id: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id'>) => Promise<void>;
  clearMessages: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          patientsData,
          doctorsData,
          timeSlotsData,
          appointmentsData,
          voiceNotesData,
          messagesData
        ] = await Promise.allSettled([
          patientsService.getAll(),
          doctorsService.getAll(),
          timeSlotsService.getAll(),
          appointmentsService.getAll(),
          voiceNotesService.getAll(),
          messagesService.getAll()
        ]);
        
        // Handle each promise result
        setPatients(patientsData.status === 'fulfilled' ? patientsData.value : []);
        setDoctors(doctorsData.status === 'fulfilled' ? doctorsData.value : []);
        setTimeSlots(timeSlotsData.status === 'fulfilled' ? timeSlotsData.value : []);
        setAppointments(appointmentsData.status === 'fulfilled' ? appointmentsData.value : []);
        setVoiceNotes(voiceNotesData.status === 'fulfilled' ? voiceNotesData.value : []);
        setMessages(messagesData.status === 'fulfilled' ? messagesData.value : []);
      } catch (error) {
        console.error('Error loading data:', error);
        // Set empty arrays to prevent loading state from getting stuck
        setPatients([]);
        setDoctors([]);
        setTimeSlots([]);
        setAppointments([]);
        setVoiceNotes([]);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // CRUD handlers
  const addPatient = async (patientData: Omit<Patient, 'id'>) => {
    const newPatient = await patientsService.create(patientData);
    setPatients(prev => [newPatient, ...prev]);
  };
  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    const updated = await patientsService.update(id, patientData);
    setPatients(prev => prev.map(p => p.id === id ? updated : p));
  };
  const deletePatient = async (id: string) => {
    await patientsService.delete(id);
    setPatients(prev => prev.filter(p => p.id !== id));
  };

  const addDoctor = async (doctorData: Omit<Doctor, 'id'>) => {
    const newDoctor = await doctorsService.create(doctorData);
    setDoctors(prev => [newDoctor, ...prev]);
  };
  const updateDoctor = async (id: string, doctorData: Partial<Doctor>) => {
    const updated = await doctorsService.update(id, doctorData);
    setDoctors(prev => prev.map(d => d.id === id ? updated : d));
  };
  const deleteDoctor = async (id: string) => {
    await doctorsService.delete(id);
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const addTimeSlot = async (slotData: Omit<TimeSlot, 'id'>) => {
    const newSlot = await timeSlotsService.create(slotData);
    setTimeSlots(prev => [newSlot, ...prev]);
  };
  const deleteTimeSlot = async (id: string) => {
    await timeSlotsService.delete(id);
    setTimeSlots(prev => prev.filter(s => s.id !== id));
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id'>) => {
    const newAppointment = await appointmentsService.create(appointmentData);
    setAppointments(prev => [newAppointment, ...prev]);
  };
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    const updated = await appointmentsService.update(id, appointmentData);
    setAppointments(prev => prev.map(a => a.id === id ? updated : a));
  };
  const deleteAppointment = async (id: string) => {
    await appointmentsService.delete(id);
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addVoiceNote = async (noteData: Omit<VoiceNote, 'id'>) => {
    const newNote = await voiceNotesService.create(noteData);
    setVoiceNotes(prev => [newNote, ...prev]);
  };
  const updateVoiceNote = async (id: string, noteData: Partial<VoiceNote>) => {
    const updated = await voiceNotesService.update(id, noteData);
    setVoiceNotes(prev => prev.map(n => n.id === id ? updated : n));
  };
  const deleteVoiceNote = async (id: string) => {
    await voiceNotesService.delete(id);
    setVoiceNotes(prev => prev.filter(n => n.id !== id));
  };

const addMessage = async (messageData: Omit<Message, 'id'>) => {
  // Always create a local message first to ensure UI updates immediately
  const tempMessage: Message = {
    id: Date.now().toString(),
    ...messageData
  };
  setMessages(prev => [...prev, tempMessage]);

  // Convert timestamp to string only for backend, keep Date for local state
  const messageForBackend = {
    ...messageData,
    timestamp: messageData.timestamp.toISOString(),
  };

  try {
    const newMessage = await messagesService.create(messageForBackend);
    setMessages(prev => prev.map(msg =>
      msg.id === tempMessage.id ? { ...newMessage, id: newMessage.id } : msg
    ));
  } catch (error) {
    console.error('Error saving message to backend:', error);
  }
};

  const clearMessages = async () => {
    try {
      // Clear backend session
      await fetch('http://localhost:8000/api/clear-session', { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error('Error clearing backend session:', error);
    }
    setMessages([]);
  };

  return (
    <DataContext.Provider
      value={{
        patients,
        doctors,
        timeSlots,
        appointments,
        voiceNotes,
        messages,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addTimeSlot,
        deleteTimeSlot,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addVoiceNote,
        updateVoiceNote,
        deleteVoiceNote,
        addMessage,
        clearMessages,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};


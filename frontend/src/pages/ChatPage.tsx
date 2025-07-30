import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MessageCircle, Send, Bot, User, Calendar, MapPin, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/contexts/DataContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PatientInfo {
  name: string;
  contact: string;
  age: number;
  gender: string;
  symptoms: string;
  location: string;
  medicalHistory: string;
}

interface DoctorRecommendation {
  id: string;
  name: string;
  specialization: string;
  location: string;
  contact: string;
  experience: number;
  rating: number;
  availability: string;
  description: string;
}

interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const ChatPage = () => {
  const { messages, addMessage, clearMessages } = useData();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [doctorRecommendations, setDoctorRecommendations] = useState<DoctorRecommendation[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRecommendation | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showTimeSlotsDialog, setShowTimeSlotsDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [patientRegistered, setPatientRegistered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

// Add welcome message on first load if no messages exist
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({
        text: "Hello! I'm your AI medical assistant. I'm here to help you find the right doctor for your needs. To get started, please tell me your name and what brings you here today.",
        isUser: false,
        timestamp: new Date,
      });
    }
  }, []); // Only run once on mount


  const sendMessageToAPI = async (message: string) => {
    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      setConversationHistory(data.conversationHistory);
      if (data.patientInfo) setPatientInfo(data.patientInfo);
      if (data.doctorRecommendations) setDoctorRecommendations(data.doctorRecommendations);
      return {
        message: data.message,
        doctorRecommendations: data.doctorRecommendations,
        hasEnoughInfo: data.hasEnoughInfo,
        isConfirming: data.isConfirming
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return { message: "I apologize, but I'm having trouble processing your request right now. Please try again later.", doctorRecommendations: null, hasEnoughInfo: false, isConfirming: false };
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const userMessage = inputValue;
      setInputValue("");
      addMessage({ text: userMessage, isUser: true, timestamp: new Date() });
      setIsTyping(true);
      
      try {
        // Get AI response
        const { message, doctorRecommendations, hasEnoughInfo, isConfirming } = await sendMessageToAPI(userMessage);
        
        // Debug logging
        console.log('API Response:', { message, doctorRecommendations, hasEnoughInfo, isConfirming });
        
        // If we have enough info and not registered, show registration dialog
        if (hasEnoughInfo && !patientRegistered) {
          setShowRegistrationDialog(true);
          setIsTyping(false);
          // Add the AI message to chat, but do not show recommendations yet
          addMessage({
            text: message,
            isUser: false,
            timestamp: new Date(),
          });
          return;
        }
        
        // Add AI response to chat
        addMessage({
          text: message,
          isUser: false,
          timestamp: new Date(),
          doctorRecommendations: doctorRecommendations && doctorRecommendations.length > 0 ? doctorRecommendations : [],
        });
        
        // Update state with doctor recommendations if available
        if (doctorRecommendations && doctorRecommendations.length > 0) {
          setDoctorRecommendations(doctorRecommendations);
        }
        
      } catch (error) {
        console.error('Error:', error);
        addMessage({
          text: "I apologize, but I'm having trouble processing your request right now. Please try again later.",
          isUser: false,
          timestamp: new Date(),
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

 const handleRegisterPatient = async () => {
  if (!patientInfo) return;

  setIsRegistering(true);

  try {
    const response = await fetch('http://localhost:8000/api/register-patient-from-chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientInfo }),
    });

    if (!response.ok) {
      throw new Error('Failed to register patient');
    }
const data = await response.json();
      setPatientRegistered(true);

      // Add success message to chat
      const successMessage = `Great! I've successfully registered you as a patient. Your information has been saved in our system.`;
      const recommendationMessage = doctorRecommendations.length > 0 
        ? `Now, let me show you some doctor recommendations based on your symptoms and location.`
        : `Let me search for doctors based on your symptoms and location.`;

       addMessage({
        text: `${successMessage} ${recommendationMessage}`,
        isUser: false,
        timestamp: new Date(),
        doctorRecommendations: doctorRecommendations.length > 0 ? doctorRecommendations : [],
      });
      
      setShowRegistrationDialog(false);
    } catch (error) {
      console.error('Error registering patient:', error);
      addMessage({
        text: "I apologize, but there was an error registering your information. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsRegistering(false);
    }
  };

 const handleGetTimeSlots = async (doctor: DoctorRecommendation) => {
    setSelectedDoctor(doctor);
    try {
      const response = await fetch(`http://localhost:8000/api/doctors/${doctor.id}/availability`);
      
      if (!response.ok) {
        throw new Error('Failed to get time slots');
      }

      const timeSlotsData = await response.json();
      setTimeSlots(timeSlotsData);
      setShowTimeSlotsDialog(true);
    } catch (error) {
      console.error('Error getting time slots:', error);
      addMessage({
        text: "I apologize, but I couldn't retrieve the available time slots. Please try again later.",
        isUser: false,
        timestamp: new Date(),
      });
    }
  };

  const handleBookAppointment = async (timeSlot: TimeSlot) => {
    console.log("Book button clicked", timeSlot);
    console.log("Selected doctor", selectedDoctor);
    console.log("Patient info", patientInfo);
    if (!selectedDoctor || !patientInfo){
      console.log("Early return: missing doctor or patient info");
      return;
    } 
   
    setIsBooking(true);
    try {
      const response = await fetch('http://localhost:8000/api/book-appointment-from-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patientName: patientInfo.name,
          doctorId: selectedDoctor.id,
          timeSlotId: timeSlot.id,
          date: timeSlot.date,
          time: timeSlot.startTime
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to book appointment');
      }

      const data = await response.json();
      
      // Add success message to chat
      addMessage({
        text: `Perfect! I've successfully booked your appointment with ${selectedDoctor.name} on ${timeSlot.date} at ${timeSlot.startTime}. You'll receive a confirmation shortly.`,
        isUser: false,
        timestamp: new Date(),
      });

      setShowTimeSlotsDialog(false);
      setSelectedDoctor(null);
      setTimeSlots([]);
    } catch (error) {
      console.error('Error booking appointment:', error);
      addMessage({
        text: "I apologize, but there was an error booking your appointment. Please try again.",
        isUser: false,
        timestamp: new Date(),
      });
    } finally {
      setIsBooking(false);
    }
  };

  const handleClearChat = async () => {
    try {
      // Clear backend session
      await fetch('http://localhost:8000/api/clear-session', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (error) {
      console.error('Error clearing backend session:', error);
    }
    
    // Clear all frontend state
    clearMessages();
    setConversationHistory([]);
    setPatientInfo(null);
    setDoctorRecommendations([]);
    setSelectedDoctor(null);
    setTimeSlots([]);
    setShowRegistrationDialog(false);
    setShowTimeSlotsDialog(false);
    setPatientRegistered(false);
    setInputValue("");
    
    // Add welcome message
    setTimeout(() => {
      addMessage({
        text: "Hello! I'm your AI medical assistant. I'm here to help you find the right doctor for your needs. To get started, please tell me your name and what brings you here today.",
        isUser: false,
        timestamp: new Date(),
      });
    }, 100);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Busy': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Offline': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-4 p-6 border-b border-glass-border">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-medical-primary to-medical-accent rounded-xl flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AI Medical Assistant</h1>
            <p className="text-sm text-slate-400">Get personalized doctor recommendations</p>
          </div>
          <Button onClick={handleClearChat} size="sm" className="ml-auto btn-secondary">
            Clear Chat
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] ${message.isUser ? 'chat-bubble-user' : 'chat-bubble-ai'}`}>
              <div className="flex items-start gap-3">
                {!message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className="flex-1">
                  <p className="text-white">{message.text}</p>
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 mt-1">
                      {/* Debug: doctorRecommendations = {message.doctorRecommendations ? message.doctorRecommendations.length : 0} */}
                    </div>
                  )}
                  
                  {message.doctorRecommendations && message.doctorRecommendations.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-2 text-medical-accent">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Doctor Recommendations ({message.doctorRecommendations.length})</span>
                      </div>
                      
                      {message.doctorRecommendations.map((doctor: DoctorRecommendation) => (
                        <div key={doctor.id} className="p-4 bg-glass-light rounded-xl border border-glass-border">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-medical-secondary to-purple-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white">{doctor.name}</h4>
                              <p className="text-sm text-medical-accent">{doctor.specialization}</p>
                            </div>
                            <Badge className={`${getAvailabilityColor(doctor.availability)} border`}>
                              {doctor.availability}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 text-sm text-slate-300 mb-3">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{doctor.location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Experience: {doctor.experience} years</span>
                              <span className="text-yellow-400">★ {doctor.rating}</span>
                            </div>
                            {doctor.description && (
                              <p className="text-slate-400 italic">{doctor.description}</p>
                            )}
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="btn-primary w-full"
                            onClick={() => handleGetTimeSlots(doctor)}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Book Appointment
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                    {message.isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
                
                {message.isUser && (
                  <div className="w-8 h-8 bg-gradient-to-r from-medical-secondary to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-bubble-ai max-w-[80%]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-medical-primary to-medical-accent rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-medical-accent rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-glass-border">
        <div className="flex gap-4">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Tell me about your symptoms, name, contact, and location..."
            className="flex-1 bg-glass border-glass-border text-white placeholder:text-slate-400"
          />
          <Button onClick={handleSendMessage} className="btn-primary px-6" disabled={!inputValue.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Patient Registration Dialog */}
      <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
        <DialogContent className="modal-glass text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Confirm Patient Registration</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {patientInfo && (
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {patientInfo.name}</div>
                <div><strong>Contact:</strong> {patientInfo.contact}</div>
                <div><strong>Age:</strong> {patientInfo.age || 'Not specified'}</div>
                <div><strong>Gender:</strong> {patientInfo.gender || 'Not specified'}</div>
                <div><strong>Location:</strong> {patientInfo.location}</div>
                <div><strong>Symptoms:</strong> {patientInfo.symptoms}</div>
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={handleRegisterPatient} 
                className="btn-secondary flex-1"
                disabled={isRegistering}
              >
                {isRegistering ? 'Registering...' : 'Confirm Registration'}
              </Button>
              <Button 
                onClick={() => setShowRegistrationDialog(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Time Slots Dialog */}
      <Dialog open={showTimeSlotsDialog} onOpenChange={setShowTimeSlotsDialog}>
        <DialogContent className="modal-glass text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              Available Time Slots - {selectedDoctor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {timeSlots.length > 0 ? (
              <div className="space-y-2">
                {timeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-3 bg-glass-light rounded-lg border border-glass-border">
                    <div>
                      <div className="font-medium">{slot.date}</div>
                      <div className="text-sm text-slate-400">{slot.startTime} - {slot.endTime}</div>
                    </div>
                    <Button 
                      size="sm" 
                      className="btn-primary"
                      onClick={() => handleBookAppointment(slot)}
                      disabled={isBooking}
                    >
                      {isBooking ? 'Booking...' : 'Book'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
                <p className="text-slate-400">No available time slots found for this doctor.</p>
              </div>
            )}
            <Button 
              onClick={() => setShowTimeSlotsDialog(false)} 
              variant="outline" 
              className="w-full"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
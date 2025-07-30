// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Calendar, Plus, Trash2, Edit, Search } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useData, type Appointment } from "@/contexts/DataContext";
// import { useContext } from "react";
// import { RoleContext } from "../contexts/RoleContext";
// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";

// const AppointmentsPage = () => {
//   const { appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment } = useData();
//   const { role } = useContext(RoleContext);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newAppointment, setNewAppointment] = useState({
//     patientName: "", doctorName: "", date: "", time: "", type: "", notes: ""
//   });

//   const appointmentTypes = ["Consultation", "Check-up", "Follow-up", "Emergency", "Surgery"];
//   const navigate = useNavigate();

//   const filteredAppointments = appointments.filter(appointment =>
//     (appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      appointment.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
//     (filterStatus === "" || appointment.status === filterStatus)
//   );

//   const handleAddAppointment = () => {
//     if (newAppointment.patientName && newAppointment.doctorName && newAppointment.date && newAppointment.time) {
//       addAppointment({ ...newAppointment, status: "Pending" as const });
//       setNewAppointment({ patientName: "", doctorName: "", date: "", time: "", type: "", notes: "" });
//       setIsAddModalOpen(false);
//     }
//   };

//   const handleDeleteAppointment = (id: string) => deleteAppointment(id);

//   const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
//     updateAppointment(id, { status: newStatus });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Confirmed": return "bg-green-500/20 text-green-400 border-green-500/30";
//       case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
//       case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
//       case "Completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
//       default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
//         <div className="flex items-center gap-3">
//           <Calendar className="w-8 h-8 text-medical-primary" />
//           <h1 className="text-3xl font-bold text-white">Appointment Management</h1>
//         </div>
//       </div>

//       {/* Filters + Book */}
//       <div className="card-glass">
//         <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
//           <div className="flex flex-col sm:flex-row gap-4 flex-1">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input
//                 placeholder="Search appointments..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
//               />
//             </div>

//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[150px]"
//             >
//               <option value="">All Status</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Pending">Pending</option>
//               <option value="Cancelled">Cancelled</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>

//           {/* Modal to Add New */}
//           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//             <DialogTrigger asChild>
//               <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />Book Appointment</Button>
//             </DialogTrigger>
//             <DialogContent className="modal-glass text-white max-w-lg">
//               <DialogHeader>
//                 <DialogTitle className="text-xl">Book New Appointment</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {/* Fields */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label>Patient</Label>
//                     <select
//                       value={newAppointment.patientName}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
//                       className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                     >
//                       <option value="">Select Patient</option>
//                       {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <Label>Doctor</Label>
//                     <select
//                       value={newAppointment.doctorName}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
//                       className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                     >
//                       <option value="">Select Doctor</option>
//                       {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label>Date</Label>
//                     <Input
//                       type="date"
//                       value={newAppointment.date}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
//                       className="bg-glass border-glass-border text-white"
//                     />
//                   </div>
//                   <div>
//                     <Label>Time</Label>
//                     <Input
//                       type="time"
//                       value={newAppointment.time}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
//                       className="bg-glass border-glass-border text-white"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label>Type</Label>
//                   <select
//                     value={newAppointment.type}
//                     onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
//                     className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                   >
//                     <option value="">Select Type</option>
//                     {appointmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <Label>Notes</Label>
//                   <textarea
//                     value={newAppointment.notes}
//                     onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
//                     className="w-full p-2 bg-glass border border-glass-border rounded-md text-white h-20 resize-none"
//                     placeholder="Additional notes..."
//                   />
//                 </div>

//                 <Button onClick={handleAddAppointment} className="btn-primary w-full">Book Appointment</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Appointments List */}
//       <div className="space-y-4">
//         {filteredAppointments.length === 0 ? (
//           <div className="card-glass text-center py-12">
//             <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
//             <p className="text-slate-400">No appointments found.</p>
//           </div>
//         ) : (
//           filteredAppointments.map((appointment) => {
//             const fileInputRef = useRef<HTMLInputElement>(null);
//             const [keyPoints, setKeyPoints] = useState<string[]>([]);

//             const handleUploadClick = () => fileInputRef.current?.click();

//             const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//               const file = e.target.files?.[0];
//               if (!file) return;

//               const formData = new FormData();
//               formData.append("audio_file", file);
              
//               try {
//                 const res = await fetch(`http://127.0.0.1:8000/appointments/${appointment.id}/upload-audio`, {
//                   method: "POST",
//                   body: formData,
//                 });
//                 if (!res.ok) {
//                   const errorText = await res.text();  // <== show server's response
//                   console.error("Upload failed", res.status, res.statusText, errorText);
//                   throw new Error("Upload failed");
//                 }
//                 const data = await res.json();
//                 setKeyPoints(data.key_points || []);
//                 alert("✅ Audio uploaded successfully!");
//               } catch (err) {
//                 console.error("Upload failed", err);
//                 alert("Failed to upload audio");
//               }
//             };

//             return (
//               <div key={appointment.id} className="card-glass hover:scale-[1.01] transition-all duration-200">
//                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                   <div className="flex-1">
//                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
//                       <h3 className="text-xl font-semibold text-white">{appointment.patientName}</h3>
//                       <Badge className={`${getStatusColor(appointment.status)} border w-fit`}>{appointment.status}</Badge>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
//                       <div><strong className="text-medical-accent">Doctor:</strong> {appointment.doctorName}</div>
//                       <div><strong className="text-medical-accent">Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
//                       <div><strong className="text-medical-accent">Time:</strong> {appointment.time}</div>
//                     </div>

//                     <div className="mt-2 text-slate-300">
//                       <strong className="text-medical-accent">Type:</strong> {appointment.type}
//                     </div>

//                     {appointment.notes && (
//                       <div className="mt-2 text-slate-400 text-sm">
//                         <strong>Notes:</strong> {appointment.notes}
//                       </div>
//                     )}

//                     {appointment.status === "Completed" && role === "user" && (
//                       <div className="mt-4 space-y-3">
//                         <input
//                           type="file"
//                           accept="audio/*"
//                           ref={fileInputRef}
//                           onChange={handleFileChange}
//                           style={{ display: "none" }}
//                         />
//                         <Button onClick={handleUploadClick} className="btn-primary">Upload Voice Note</Button>
//                         <Button
//                           className="mt-3 btn-secondary"
//                           onClick={() => navigate(`/voice-note/${appointment.id}`)}
//                         >
//                           Chat About This Appointment
//                         </Button>
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex gap-2 flex-wrap">
//                     {appointment.status === "Pending" && (
//                       <Button
//                         size="sm"
//                         onClick={() => handleStatusChange(appointment.id, "Confirmed")}
//                         className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
//                       >
//                         Confirm
//                       </Button>
//                     )}
//                     {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
//                       <Button
//                         size="sm"
//                         onClick={() => handleStatusChange(appointment.id, "Cancelled")}
//                         className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                     <Button size="sm" variant="ghost" className="text-slate-400 hover:text-medical-accent hover:bg-glass-light">
//                       <Edit className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => handleDeleteAppointment(appointment.id)}
//                       className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppointmentsPage;

// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { SidebarTrigger } from "@/components/ui/sidebar";
// import { Calendar, Plus, Trash2, Edit, Search } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { useData, type Appointment } from "@/contexts/DataContext";
// import { useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import MicRecorder from 'mic-recorder-to-mp3-fixed';
// import { toast } from "react-toastify";


// const AppointmentsPage = () => {
//   const { appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment } = useData();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterStatus, setFilterStatus] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [newAppointment, setNewAppointment] = useState({
//     patientName: "", doctorName: "", date: "", time: "", type: "", notes: ""
//   });

//   const appointmentTypes = ["Consultation", "Check-up", "Follow-up", "Emergency", "Surgery"];
//   const navigate = useNavigate();
//   const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
//   const [recordingAppointmentId, setRecordingAppointmentId] = useState<string | null>(null);
//   const [isRecording, setIsRecording] = useState(false);

  

//   const filteredAppointments = appointments.filter(appointment =>
//     (appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//      appointment.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
//     (filterStatus === "" || appointment.status === filterStatus)
//   );

//   const handleAddAppointment = () => {
//     if (newAppointment.patientName && newAppointment.doctorName && newAppointment.date && newAppointment.time) {
//       addAppointment({ ...newAppointment, status: "Pending" as const });
//       setNewAppointment({ patientName: "", doctorName: "", date: "", time: "", type: "", notes: "" });
//       setIsAddModalOpen(false);
//     }
//   };

//   const handleDeleteAppointment = (id: string) => deleteAppointment(id);

//   const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
//     updateAppointment(id, { status: newStatus });
//   };


//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Confirmed": return "bg-green-500/20 text-green-400 border-green-500/30";
//       case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
//       case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
//       case "Completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
//       default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
//     }
//   };

//   const handleStartRecording = async (appointmentId: string) => {
//     try {
//       await recorderRef.current.start();
//       setIsRecording(true);
//       setRecordingAppointmentId(appointmentId);
//       toast.info("🎙️ Recording started...");
//     } catch (err) {
//       console.error("Could not start recording:", err);
//       toast.error("Failed to start recording");
//     }
//   };

//   const handleStopRecording = async (appointmentId: string) => {
//     try {
//       const [buffer, blob] = await recorderRef.current.stop().getMp3();

//       const formData = new FormData();
//       formData.append("audio_file", blob, "recording.mp3");

//       const response = await fetch(`http://127.0.0.1:8000/appointments/${appointmentId}/upload-audio`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Upload failed");
//       }

//       const data = await response.json();
//       toast.success("✅ Audio uploaded and transcribed!");
//     } catch (err) {
//       console.error("Recording error:", err);
//       toast.error("❌ Failed to stop/upload recording");
//     } finally {
//       setIsRecording(false);
//       setRecordingAppointmentId(null);
//     }
//   };


//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex items-center gap-4 mb-8">
//         <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
//         <div className="flex items-center gap-3">
//           <Calendar className="w-8 h-8 text-medical-primary" />
//           <h1 className="text-3xl font-bold text-white">Appointment Management</h1>
//         </div>
//       </div>

//       {/* Filters + Book */}
//       <div className="card-glass">
//         <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
//           <div className="flex flex-col sm:flex-row gap-4 flex-1">
//             <div className="relative flex-1 max-w-md">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//               <Input
//                 placeholder="Search appointments..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
//               />
//             </div>

//             <select
//               value={filterStatus}
//               onChange={(e) => setFilterStatus(e.target.value)}
//               className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[150px]"
//             >
//               <option value="">All Status</option>
//               <option value="Confirmed">Confirmed</option>
//               <option value="Pending">Pending</option>
//               <option value="Cancelled">Cancelled</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </div>

//           {/* Modal to Add New */}
//           <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
//             <DialogTrigger asChild>
//               <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />Book Appointment</Button>
//             </DialogTrigger>
//             <DialogContent className="modal-glass text-white max-w-lg">
//               <DialogHeader>
//                 <DialogTitle className="text-xl">Book New Appointment</DialogTitle>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {/* Fields */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label>Patient</Label>
//                     <select
//                       value={newAppointment.patientName}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
//                       className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                     >
//                       <option value="">Select Patient</option>
//                       {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
//                     </select>
//                   </div>
//                   <div>
//                     <Label>Doctor</Label>
//                     <select
//                       value={newAppointment.doctorName}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
//                       className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                     >
//                       <option value="">Select Doctor</option>
//                       {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4">
//                   <div>
//                     <Label>Date</Label>
//                     <Input
//                       type="date"
//                       value={newAppointment.date}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
//                       className="bg-glass border-glass-border text-white"
//                     />
//                   </div>
//                   <div>
//                     <Label>Time</Label>
//                     <Input
//                       type="time"
//                       value={newAppointment.time}
//                       onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
//                       className="bg-glass border-glass-border text-white"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <Label>Type</Label>
//                   <select
//                     value={newAppointment.type}
//                     onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
//                     className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
//                   >
//                     <option value="">Select Type</option>
//                     {appointmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <Label>Notes</Label>
//                   <textarea
//                     value={newAppointment.notes}
//                     onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
//                     className="w-full p-2 bg-glass border border-glass-border rounded-md text-white h-20 resize-none"
//                     placeholder="Additional notes..."
//                   />
//                 </div>

//                 <Button onClick={handleAddAppointment} className="btn-primary w-full">Book Appointment</Button>
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </div>

//       {/* Appointments List */}
//       <div className="space-y-4">
//         {filteredAppointments.length === 0 ? (
//           <div className="card-glass text-center py-12">
//             <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
//             <p className="text-slate-400">No appointments found.</p>
//           </div>
//         ) : (
//           filteredAppointments.map((appointment) => {
//             const fileInputRef = useRef<HTMLInputElement>(null);
//             const [keyPoints, setKeyPoints] = useState<string[]>([]);

//             const handleUploadClick = () => fileInputRef.current?.click();

//             const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//               const file = e.target.files?.[0];
//               if (!file) return;

//               const formData = new FormData();
//               formData.append("audio_file", file);
              
//               try {
//                 const res = await fetch(`http://127.0.0.1:8000/appointments/${appointment.id}/upload-audio`, {
//                   method: "POST",
//                   body: formData,
//                 });
//                 if (!res.ok) {
//                   const errorText = await res.text();  // <== show server's response
//                   console.error("Upload failed", res.status, res.statusText, errorText);
//                   throw new Error("Upload failed");
//                 }
//                 const data = await res.json();
//                 setKeyPoints(data.key_points || []);
//                 alert("✅ Audio uploaded successfully!");
//               } catch (err) {
//                 console.error("Upload failed", err);
//                 alert("Failed to upload audio");
//               }
//             };

//             return (
//               <div key={appointment.id} className="card-glass hover:scale-[1.01] transition-all duration-200">
//                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//                   <div className="flex-1">
//                     <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
//                       <h3 className="text-xl font-semibold text-white">{appointment.patientName}</h3>
//                       <Badge className={`${getStatusColor(appointment.status)} border w-fit`}>{appointment.status}</Badge>
//                     </div>

//                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
//                       <div><strong className="text-medical-accent">Doctor:</strong> {appointment.doctorName}</div>
//                       <div><strong className="text-medical-accent">Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
//                       <div><strong className="text-medical-accent">Time:</strong> {appointment.time}</div>
//                     </div>

//                     <div className="mt-2 text-slate-300">
//                       <strong className="text-medical-accent">Type:</strong> {appointment.type}
//                     </div>

//                     {appointment.notes && (
//                       <div className="mt-2 text-slate-400 text-sm">
//                         <strong>Notes:</strong> {appointment.notes}
//                       </div>
//                     )}

//                     {appointment.status === "Completed" && (
//                       <div className="mt-4 space-y-3">
//                         <input
//                           type="file"
//                           accept="audio/*"
//                           ref={fileInputRef}
//                           onChange={handleFileChange}
//                           style={{ display: "none" }}
//                         />
//                         <Button onClick={handleUploadClick} className="btn-primary">Upload Voice Note</Button>

//                               {/* Start/Stop Recording */}
//                         {!isRecording || recordingAppointmentId !== appointment.id ? (
//                           <Button
//                             onClick={() => handleStartRecording(appointment.id)}
//                             className="bg-green-600 hover:bg-green-700 text-white"
//                           >
//                             🎙️ Start Recording
//                           </Button>
//                         ) : (
//                           <Button
//                             onClick={() => handleStopRecording(appointment.id)}
//                             className="bg-red-600 hover:bg-red-700 text-white"
//                           >
//                             ⏹️ Stop Recording
//                           </Button>
//                         )}

//                         <Button
//                               className="mt-3 btn-secondary"
//                               onClick={() => navigate(`/voice-note/${appointment.id}`)}
//                             >
//                               Chat About This Appointment
//                         </Button>
                          
                        
//                       </div>
//                     )}
//                   </div>

//                   <div className="flex gap-2 flex-wrap">
//                     {appointment.status === "Pending" && (
//                       <Button
//                         size="sm"
//                         onClick={() => handleStatusChange(appointment.id, "Confirmed")}
//                         className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
//                       >
//                         Confirm
//                       </Button>
//                     )}
//                     {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
//                       <Button
//                         size="sm"
//                         onClick={() => handleStatusChange(appointment.id, "Cancelled")}
//                         className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
//                       >
//                         Cancel
//                       </Button>
//                     )}
//                     <Button size="sm" variant="ghost" className="text-slate-400 hover:text-medical-accent hover:bg-glass-light">
//                       <Edit className="w-4 h-4" />
//                     </Button>
//                     <Button
//                       size="sm"
//                       variant="ghost"
//                       onClick={() => handleDeleteAppointment(appointment.id)}
//                       className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
//                     >
//                       <Trash2 className="w-4 h-4" />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// };

// export default AppointmentsPage;

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Calendar, Plus, Trash2, Edit, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useData, type Appointment } from "@/contexts/DataContext";
import { useContext } from "react";
import { RoleContext } from "../contexts/RoleContext";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import MicRecorder from 'mic-recorder-to-mp3-fixed';
import { toast } from "react-toastify";


const AppointmentsPage = () => {
  const { appointments, patients, doctors, addAppointment, updateAppointment, deleteAppointment } = useData();
  const { role } = useContext(RoleContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientName: "", doctorName: "", date: "", time: "", type: "", notes: ""
  });

  const appointmentTypes = ["Consultation", "Check-up", "Follow-up", "Emergency", "Surgery"];
  const navigate = useNavigate();

  const filteredAppointments = appointments.filter(appointment =>
    (appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     appointment.type.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === "" || appointment.status === filterStatus)
  );

  const handleAddAppointment = () => {
    if (newAppointment.patientName && newAppointment.doctorName && newAppointment.date && newAppointment.time) {
      addAppointment({ ...newAppointment, status: "Pending" as const });
      setNewAppointment({ patientName: "", doctorName: "", date: "", time: "", type: "", notes: "" });
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteAppointment = (id: string) => deleteAppointment(id);

  const handleStatusChange = (id: string, newStatus: Appointment["status"]) => {
    updateAppointment(id, { status: newStatus });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Cancelled": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "Completed": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
  const [recordingAppointmentId, setRecordingAppointmentId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  
  const handleStartRecording = async (appointmentId: string) => {
    try {
      await recorderRef.current.start();
      setIsRecording(true);
      setRecordingAppointmentId(appointmentId);
      toast.info("🎙️ Recording started...");
    } catch (err) {
      console.error("Could not start recording:", err);
      toast.error("Failed to start recording");
    }
  };

  const handleStopRecording = async (appointmentId: string) => {
    try {
      const [buffer, blob] = await recorderRef.current.stop().getMp3();

      const formData = new FormData();
      formData.append("audio_file", blob, "recording.mp3");

      const response = await fetch(`http://127.0.0.1:8000/appointments/${appointmentId}/upload-audio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      toast.success("✅ Audio uploaded and transcribed!");
    } catch (err) {
      console.error("Recording error:", err);
      toast.error("❌ Failed to stop/upload recording");
    } finally {
      setIsRecording(false);
      setRecordingAppointmentId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <SidebarTrigger className="text-white hover:bg-glass-light p-2 rounded-lg" />
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-medical-primary" />
          <h1 className="text-3xl font-bold text-white">Appointment Management</h1>
        </div>
      </div>

      {/* Filters + Book */}
      <div className="card-glass">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-glass border-glass-border text-white placeholder:text-slate-400"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 bg-glass border border-glass-border rounded-md text-white min-w-[150px]"
            >
              <option value="">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Modal to Add New */}
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary"><Plus className="w-4 h-4 mr-2" />Book Appointment</Button>
            </DialogTrigger>
            <DialogContent className="modal-glass text-white max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl">Book New Appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient</Label>
                    <select
                      value={newAppointment.patientName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, patientName: e.target.value })}
                      className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                    >
                      <option value="">Select Patient</option>
                      {patients.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Doctor</Label>
                    <select
                      value={newAppointment.doctorName}
                      onChange={(e) => setNewAppointment({ ...newAppointment, doctorName: e.target.value })}
                      className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                    />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({ ...newAppointment, time: e.target.value })}
                      className="bg-glass border-glass-border text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({ ...newAppointment, type: e.target.value })}
                    className="w-full p-2 bg-glass border border-glass-border rounded-md text-white"
                  >
                    <option value="">Select Type</option>
                    {appointmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div>
                  <Label>Notes</Label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({ ...newAppointment, notes: e.target.value })}
                    className="w-full p-2 bg-glass border border-glass-border rounded-md text-white h-20 resize-none"
                    placeholder="Additional notes..."
                  />
                </div>

                <Button onClick={handleAddAppointment} className="btn-primary w-full">Book Appointment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="card-glass text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50 text-slate-400" />
            <p className="text-slate-400">No appointments found.</p>
          </div>
        ) : (
          filteredAppointments.map((appointment) => {
            const fileInputRef = useRef<HTMLInputElement>(null);
            const [keyPoints, setKeyPoints] = useState<string[]>([]);

            const handleUploadClick = () => fileInputRef.current?.click();

            const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("audio_file", file);
              
              try {
                const res = await fetch(`http://127.0.0.1:8000/appointments/${appointment.id}/upload-audio`, {
                  method: "POST",
                  body: formData,
                });
                if (!res.ok) {
                  const errorText = await res.text();  // <== show server's response
                  console.error("Upload failed", res.status, res.statusText, errorText);
                  throw new Error("Upload failed");
                }
                const data = await res.json();
                setKeyPoints(data.key_points || []);
                alert("✅ Audio uploaded successfully!");
              } catch (err) {
                console.error("Upload failed", err);
                alert("Failed to upload audio");
              }
            };

            return (
              <div key={appointment.id} className="card-glass hover:scale-[1.01] transition-all duration-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-white">{appointment.patientName}</h3>
                      <Badge className={`${getStatusColor(appointment.status)} border w-fit`}>{appointment.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-300">
                      <div><strong className="text-medical-accent">Doctor:</strong> {appointment.doctorName}</div>
                      <div><strong className="text-medical-accent">Date:</strong> {new Date(appointment.date).toLocaleDateString()}</div>
                      <div><strong className="text-medical-accent">Time:</strong> {appointment.time}</div>
                    </div>

                    <div className="mt-2 text-slate-300">
                      <strong className="text-medical-accent">Type:</strong> {appointment.type}
                    </div>

                    {appointment.notes && (
                      <div className="mt-2 text-slate-400 text-sm">
                        <strong>Notes:</strong> {appointment.notes}
                      </div>
                    )}

                    {appointment.status === "Completed" && role === "user" && (
                      <div className="mt-4 space-y-3">
                        <input
                          type="file"
                          accept="audio/*"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                        <Button onClick={handleUploadClick} className="btn-primary">Upload Voice Note</Button>
                                                

                              {/* Start/Stop Recording */}
                        {!isRecording || recordingAppointmentId !== appointment.id ? (
                          <Button
                            onClick={() => handleStartRecording(appointment.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            🎙️ Start Recording
                          </Button>
                        ) : (
                          <Button
                            onClick={() => handleStopRecording(appointment.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            ⏹️ Stop Recording
                          </Button>
                        )}
                        <Button
                          className="mt-3 btn-secondary"
                          onClick={() => navigate(`/voice-note/${appointment.id}`)}
                        >
                          Chat About This Appointment
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {appointment.status === "Pending" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, "Confirmed")}
                        className="bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30"
                      >
                        Confirm
                      </Button>
                    )}
                    {appointment.status !== "Cancelled" && appointment.status !== "Completed" && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(appointment.id, "Cancelled")}
                        className="bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                      >
                        Cancel
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-medical-accent hover:bg-glass-light">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteAppointment(appointment.id)}
                      className="text-slate-400 hover:text-red-400 hover:bg-glass-light"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;
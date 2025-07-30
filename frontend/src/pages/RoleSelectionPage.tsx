import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoleContext } from '../contexts/RoleContext';
import { Button } from "@/components/ui/button";


const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleSelect = (role) => {
    setRole(role);
    // Always clear admin_token when switching to admin role to force auth form
    if (role === 'admin') {
      localStorage.removeItem('admin_token');
    }
    setTimeout(() => {
      if (role === 'user') {
        navigate('/user-home');
      } else {
        navigate('/admin-auth');
      }
    }, 0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-darkblue-100">
      <h1 className="text-4xl font-extrabold mb-4 text-medical-accent">Welcome to MEDFLOW-AI</h1>
      <h2 className="text-3xl font-bold mb-8">Select Role</h2>
      <div className="space-x-4">
        <Button
          className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleSelect('user')}
        >
          Enter as User
        </Button>
        <Button
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={() => handleSelect('admin')}
        >
          Enter as Admin
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

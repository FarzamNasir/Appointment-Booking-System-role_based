import React, { createContext, useState, useEffect } from 'react';


export const RoleContext = createContext({
  role: null,
  setRole: (role: string | null) => {},
  logout: () => {},
});

export const RoleProvider = ({ children }) => {
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  useEffect(() => {
    if (role) localStorage.setItem('role', role);
    else localStorage.removeItem('role');
  }, [role]);

  const logout = () => {
    setRole(null);
    localStorage.removeItem('role');
    localStorage.removeItem('admin_token');
  };

  return (
    <RoleContext.Provider value={{ role, setRole, logout }}>
      {children}
    </RoleContext.Provider>
  );
};

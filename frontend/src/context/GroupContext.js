import React, { createContext, useState, useContext } from 'react';

const GroupContext = createContext();

export const GroupProvider = ({ children }) => {
  const [groupData, setGroupData] = useState({
    nombre: '',
    tipoComunidad: '',
    ubicacion: null,
    privacidad: '',
    grupo_codigo: '',
  });

  return (
    <GroupContext.Provider value={{ groupData, setGroupData }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = () => useContext(GroupContext);

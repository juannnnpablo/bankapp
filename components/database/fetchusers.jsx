import { useEffect, useState } from 'react';
import { supabase } from '@/components/database/config';

async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*'); // Selecciona todas las columnas
  
    if (error) {
      console.error("Error al obtener usuarios:", error);
      return null;
    }
  
    console.log("Usuarios obtenidos:", data);
    return data;
}

export default fetchUsers;
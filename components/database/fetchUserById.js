import { supabase } from '@/components/database/config'; 

export async function fetchUserById(userId) {
  const { data, error } = await supabase
    .from('users') 
    .select('*')
    .eq('id', userId)
    .single(); 

  if (error) {
    console.error('Error al obtener los datos del usuario:', error);
    return null;
  }

  return data;
}

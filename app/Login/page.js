"use client"

import { useState, useEffect } from 'react';
import { supabase } from "@/components/database/config";
import fetchUsers from '@/components/database/fetchusers';
import { useAuth } from '@/components/database/authContext';

const LoginForm = () => {
   const [users, setUsers] = useState([]);
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [authenticated, setAuthenticated] = useState(false);
   const { login } = useAuth();

   useEffect(() => {
      async function getUsers() {
         const data = await fetchUsers();
         setUsers(data);
      }
  
      getUsers();
   }, []);

   let o = false;
   const handleSubmit = (event) => {
      event.preventDefault();
      if (users) {
         users.forEach((user) => {
            if (user.email === email && user.password === password) {
               console.log('Usuario autenticado:', user);
               login(user.id, user.name);
               o = true;
               setAuthenticated(true);
            } else if (user.email !== email && user.password !== password && o === false) {
               console.log('Credenciales incorrectas');
            }
         });
      }
   };

   return (
      <div>
         <form onSubmit={handleSubmit}>
            <div>
               <label htmlFor="email">Correo Electrónico:</label>
               <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
               />
            </div>
            <div>
               <label htmlFor="password">Contraseña:</label>
               <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
               />
            </div>

            {!authenticated && <button type="submit">Iniciar Sesión</button>}
        
            {!authenticated && (
               <button type="button">
                  <a href='/Singin'>Registrar si no tienes cuenta</a>
               </button>
            )}
            {authenticated && (
               <button type="button">
                  <a href='/dashboard/profile'> Continuar al perfil</a>
               </button>
            )}
            {authenticated && (
               <p style={{ color: 'green' }}>Has sido autenticado exitosamente.</p>
            )}
         </form>
      </div>
   );
}

export default LoginForm;

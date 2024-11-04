"use client";

import { useState } from 'react';
import { supabase } from "@/components/database/config";


const RegistrationForm = () => {
   const [name, setName] = useState('');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [accountType, setAccountType] = useState('ahorros');
   const [accountNumber, setAccountNumber] = useState('');
   const [registered, setRegistered] = useState(false);

   const handleSubmit = async (event) => {
      event.preventDefault();
      const { data, error } = await supabase
         .from('users')
         .insert([
            {
               name: name,
               email: email,
               password: password,
               account_type: accountType,
               account_number: accountNumber,
               balance: 0,
            },
         ]);
      

      if (error) {
         console.error('Error al registrar:', error);
      } else {
         console.log('Usuario registrado:', data);
         setRegistered(true);
      }
   };

   return (
      <div>
         <form onSubmit={handleSubmit}>
            <div>
               <label htmlFor="name">Nombre:</label>
               <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
               />
            </div>
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
            <div>
               <label htmlFor="accountType">Tipo de Cuenta:</label>
               <select
                  id="accountType"
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
               >
                  <option value="ahorros">Ahorros</option>
                  <option value="corriente">Corriente</option>
               </select>
            </div>
            <div>
               <label htmlFor="accountNumber">Número de Cuenta:</label>
               <input
                  type="text"
                  id="accountNumber"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
               />
            </div>
            <button type="submit">Registrar</button>
         </form>
         {registered && (
            <div>
               <p style={{ color: 'green' }}>¡Registro exitoso! Ahora puedes iniciar sesión.</p>
               <button style={{ marginTop: '10px' }}>
                  <a href="/Login">Continuar</a>   
               </button>
            </div>
         )}
      </div>
   );
};

export default RegistrationForm;

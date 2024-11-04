"use client"

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/database/authContext'; 
import { fetchUserById } from '@/components/database/fetchUserById';
import { supabase } from '@/components/database/config'; 
import  style  from './page.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanTerm, setLoanTerm] = useState('');
  const [depositError, setDepositError] = useState(null);
  const [withdrawError, setWithdrawError] = useState(null);
  const [loanError, setLoanError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [transactions, setTransactions] = useState([]); 
  const [reportData, setReportData] = useState(null); 

  useEffect(() => {
    const getUserData = async () => {
      if (user) {
        setLoading(true);
        const data = await fetchUserById(user.id); 
        if (data) {
          setUserData(data);
          await fetchTransactions(data.id); 
          await fetchReportData(data.id); 
        } else {
          setError('No se pudo obtener la información del usuario.');
        }
        setLoading(false);
      }
    };

    getUserData();
  }, [user]);

  const fetchTransactions = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false }); 

      if (error) throw error;
      setTransactions(data); 
    } catch (error) {
      console.error('Error al obtener las transacciones:', error);
    }
  };

  const fetchReportData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .single(); 

      if (error) throw error;
      setReportData(data || { total_income: 0, total_expense: 0, debts: 0 }); 
    } catch (error) {
    }
  };

  const handleDeposit = async (event) => {
    event.preventDefault();
    
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setDepositError('Por favor, ingresa un monto válido.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ balance: userData.balance + amount })
        .eq('id', userData.id);

        console.log("bien")
      if (error) throw error;

      await supabase.from('transactions').insert({
        user_id: userData.id,
        type: 'deposito',
        amount: amount,
        date: new Date().toISOString() 
      });
      console.log("bien")


      const passIncome = await supabase.from('reports').select(
        "total_income"
      ).eq('user_id', userData.id);

      console.log(passIncome);

      if (passIncome.data.length > 0) {
      await supabase.from('reports').update({
        total_income: passIncome.data[0].total_income + amount,
      }).eq('user_id', userData.id);
        } else { 
            await supabase.from('reports').insert({
                user_id: userData.id,
                total_income: amount,
                total_expense: 0,
                debts: 0,
              });
        }
     console.log("bien")
      setUserData({ ...userData, balance: userData.balance + amount });
      setSuccessMessage('Depósito realizado con éxito!');
      setDepositAmount('');
      setDepositError(null);
      fetchTransactions(userData.id);
      fetchReportData(userData.id);

    } catch (error) {
      setDepositError('Hubo un problema al realizar el depósito: ' + error.message);
      setSuccessMessage(null);
    }
  };

  const handleWithdraw = async (event) => {
    event.preventDefault();

    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0 || amount > userData.balance) {
      setWithdrawError('Por favor, ingresa un monto válido que no exceda tu saldo.');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ balance: userData.balance - amount }) 
        .eq('id', userData.id);

      if (error) throw error;

      await supabase.from('transactions').insert({
        user_id: userData.id,
        type: 'retiro',
        amount: amount,
        date: new Date().toISOString() 
      });

      const passExpense = await supabase.from('reports').select(
        "total_expense"
      ).eq('user_id', userData.id);

      if (passExpense.data.length > 0) {
        await supabase.from('reports').update({
            total_expense: passExpense.data[0].total_expense + amount,
          }).eq('user_id', userData.id);
          } else { 
              await supabase.from('reports').insert({
                  user_id: userData.id,
                  total_income: 0,
                  total_expense: 0,
                  debts: 0,
                });
          }

      setUserData({ ...userData, balance: userData.balance - amount });
      setSuccessMessage('Retiro realizado con éxito!');
      setWithdrawAmount('');
      setWithdrawError(null);

      fetchTransactions(userData.id);
      fetchReportData(userData.id);

    } catch (error) {
      setWithdrawError('Hubo un problema al realizar el retiro: ' + error.message);
      setSuccessMessage(null);
    }
  };

  const handleLoanRequest = async (event) => {
    event.preventDefault();
    
    const amount = parseFloat(loanAmount);
    const term = parseInt(loanTerm);
    if (!amount || amount <= 0 || !term || term <= 0) {
      setLoanError('Por favor, ingresa un monto y un plazo válidos.');
      return;
    }

    try {
      const { data: loanData, error: loanError } = await supabase.from('loans').insert({
        user_id: userData.id,
        amount: amount,
        term: term,
        status: 'pendiente',
        request_date: new Date().toISOString()
      });

      if (loanError) throw loanError;

      const { error: balanceError } = await supabase
        .from('users')
        .update({ balance: userData.balance + amount }) 
        .eq('id', userData.id);

      const passDebts = await supabase.from('reports').select(
        "debts"
      ).eq('user_id', userData.id);

      if (passDebts.data.length > 0) {
        await supabase.from('reports').update({
            debts: passDebts.data[0].debts + amount,
          }).eq('user_id', userData.id);
          } else { 
              await supabase.from('reports').insert({
                  user_id: userData.id,
                  total_income: 0,
                  total_expense: 0,
                  debts: amount,
                });
          }

      await supabase.from('transactions').insert({
        user_id: userData.id,
        type: "deposito", 
        amount: amount,
        date: new Date().toISOString() 
      });

      if (balanceError) throw balanceError;

      setUserData({ ...userData, balance: userData.balance + amount });
      setSuccessMessage('Préstamo solicitado con éxito!');
      setLoanAmount('');
      setLoanTerm('');
      setLoanError(null);

      fetchTransactions(userData.id);
      fetchReportData(userData.id);

    } catch (error) {
      setLoanError('Hubo un problema al solicitar el préstamo: ' + error.message);
      setSuccessMessage(null);
    }
  };

  if (loading) {
    return <p>Cargando datos del usuario...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1 style={{ fontSize: "3rem" }} >Dashboard</h1>
      <h1 style={{ fontSize: "5rem" }} >Bienvenido, {userData.name}!</h1>
      <div className={style.divHeader}>
        <div >
        <h2>Detalles de la Cuenta</h2>
        <p>ID: {userData.id}</p>
        <p>Correo: {userData.email}</p>
        <p>Número de Cuenta: {userData.account_number}</p>
        <p>Tipo de Cuenta: {userData.account_type}</p>
        <p>Saldo: ${userData.balance.toFixed(2)}</p>
        </div>

        <div >
        <h2>Reportes Financieros</h2>
        {reportData && (
            <div>
            <p>Total Ingresos: ${reportData.total_income.toFixed(2)}</p>
            <p>Total Gastos: ${reportData.total_expense.toFixed(2)}</p>
            <p>Deudas Totales: ${reportData.debts.toFixed(2)}</p>
            </div>
        )}
        </div>
        </div>
      <h2>Realizar un Depósito</h2>
      <form onSubmit={handleDeposit}>
        <input
          type="number"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          placeholder="Monto a Depositar"
        />
        <button type="submit">Depositar</button>
      </form>
      {depositError && <p style={{ color: 'red' }}>{depositError}</p>}
      
      <h2>Realizar un Retiro</h2>
      <form onSubmit={handleWithdraw}>
        <input
          type="number"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          placeholder="Monto a Retirar"
        />
        <button type="submit">Retirar</button>
      </form>
      {withdrawError && <p style={{ color: 'red' }}>{withdrawError}</p>}
      
      <h2>Solicitar un Préstamo</h2>
      <form onSubmit={handleLoanRequest}>
        <input
          type="number"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          placeholder="Monto del Préstamo"
        />
        <input
          type="number"
          value={loanTerm}
          onChange={(e) => setLoanTerm(e.target.value)}
          placeholder="Plazo (en meses)"
        />
        <button type="submit">Solicitar Préstamo</button>
      </form>
      {loanError && <p style={{ color: 'red' }}>{loanError}</p>}
      
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

      <h2>Historial de Transacciones</h2>
      {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              {transaction.date}: {transaction.type} - ${transaction.amount.toFixed(2)}
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay transacciones registradas.</p>
      )}
    </div>
  );
}

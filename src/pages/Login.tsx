import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import bcrypt from 'bcryptjs';

const DUMMY_USERS = [
  { username: 'admin', password: 'admin123', role: 'Administrator' },
  { username: 'manager', password: 'manager123', role: 'Manager' },
  { username: 'cashier', password: 'cashier123', role: 'Cashier' },
];

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Ambil employee dari Supabase berdasarkan username
    const { data, error } = await supabase
      .from('employees')
      .select('id, nama, username, password, role, status')
      .eq('username', username)
      .single();
    if (error || !data) {
      setError('Username tidak ditemukan');
      return;
    }
    if (data.status !== 'Active') {
      setError('Akun Anda tidak aktif');
      return;
    }
    const passwordMatch = await bcrypt.compare(password, data.password);
    if (!passwordMatch) {
      setError('Password salah');
      return;
    }
    // Simpan user ke localStorage
    localStorage.setItem('studio_pos_user', JSON.stringify({
      id: data.id,
      nama: data.nama,
      username: data.username,
      role: data.role,
      status: data.status
    }));
    setError('');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-6 "
      >
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-gray-600">Loging Berdasarkan User</p>
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <Button type="submit" className="w-full bg-blue-700 hover:bg-blue-900">Login</Button>
        <div className="text-xs text-gray-400 text-center pt-2">
          <div>admin/admin123</div>
          <div>manager/manager123</div>
          <div>cashier/cashier123</div>
        </div>
      </form>
    </div>
  );
};

export default Login; 
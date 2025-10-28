import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { RoleAccessContext } from '@/context/RoleAccessContext';

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
  const { refresh } = useContext(RoleAccessContext);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Username dan password harus diisi');
      return;
    }

    try {
      setError('');
      
      // Use authService for authentication
      const result = await authService.login({ username, password });
      
      if (!result.success) {
        setError(result.error || 'Login gagal');
        return;
      }

      if (!result.user) {
        setError('User data tidak ditemukan');
        return;
      }

      // Save user to session
      authService.saveUser(result.user);
      
      // Refresh role permissions
      await refresh(result.user.role);
      
      // Navigate to dashboard
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login');
    }
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
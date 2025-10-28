import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { nativeDatabaseService } from '@/services/nativeDatabaseService';
import { authService } from '@/services/authService';
import { LoginWrapper } from './LoginWrapper';

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: string;
  full_name: string;
  is_active: boolean;
}

interface NativeLoginProps {
  onLoginSuccess: (user: User) => void;
  onSetupRequired?: () => void;
  onResetSetup?: () => void;
}

export const NativeLogin: React.FC<NativeLoginProps> = ({ 
  onLoginSuccess, 
  onSetupRequired,
  onResetSetup
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFirstRun, setIsFirstRun] = useState(false);

  useEffect(() => {
    checkFirstRun();
  }, []);

  const checkFirstRun = async () => {
    try {
      const detectionResult = await nativeDatabaseService.detectDatabase();
      setIsFirstRun(detectionResult.isFirstRun);
      
      if (detectionResult.isFirstRun && onSetupRequired) {
        onSetupRequired();
      }
    } catch (error) {
      console.error('Failed to check first run:', error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Use authService for universal authentication
      console.log('🔐 Attempting login with authService...');
      const result = await authService.login({ username, password });

      if (!result.success) {
        setError(result.error || 'Invalid username or password');
        return;
      }

      if (!result.user) {
        setError('User data not found');
        return;
      }

      // Store current user in session
      authService.saveUser(result.user);
      onLoginSuccess(result.user);
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  const handleResetSetup = () => {
    // Clear all setup-related localStorage data
    localStorage.removeItem('database_setup_completed');
    localStorage.removeItem('database_setup_date');
    localStorage.removeItem('database_setup_skipped');
    localStorage.removeItem('database_config');
    
    // Call the reset callback if provided
    if (onResetSetup) {
      onResetSetup();
    }
  };

  if (isFirstRun) {
    return (
      <LoginWrapper>
        <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Welcome to Studio POS</CardTitle>
          <CardDescription className="text-center">
            This appears to be your first time running the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please complete the setup process first before logging in.
            </AlertDescription>
          </Alert>
          {onSetupRequired && (
            <Button onClick={onSetupRequired} className="w-full">
              Go to Setup
            </Button>
          )}
        </CardContent>
      </Card>
      </LoginWrapper>
    );
  }

  return (
    <LoginWrapper>
      <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <LogIn className="h-5 w-5" />
          Studio POS Login
        </CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access the application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Username Field */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Login Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </>
            )}
          </Button>

          {/* Quick Login for Demo */}
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleQuickLogin}
              disabled={isLoading}
              className="text-xs"
            >
              Use Default Credentials (admin/admin123)
            </Button>
          </div>
        </form>

        {/* Default Credentials Info */}
        <div className="mt-6 p-3 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">Default Credentials:</h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div><strong>Username:</strong> admin</div>
            <div><strong>Password:</strong> admin123</div>
          </div>
        </div>

        {/* Reset Setup Button (for testing) */}
        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetSetup}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Reset Database Setup
          </Button>
        </div>
      </CardContent>
    </Card>
    </LoginWrapper>
  );
};

export default NativeLogin;

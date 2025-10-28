/**
 * Authentication Service - Universal Authentication Layer
 * 
 * This service provides authentication functionality regardless of the underlying database
 * Supports: Supabase, PostgreSQL, SQLite, and LocalStorage
 */

import { databaseService } from './databaseService';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email?: string;
  nama?: string;
  role: string;
  status?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  private static instance: AuthService;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Authenticate user with username and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password } = credentials;

      if (!username || !password) {
        return {
          success: false,
          error: 'Username and password are required'
        };
      }

      // Check if running in Electron
      const isElectron = typeof window !== 'undefined' && 
        (window as any).electronAPI?.auth?.login;

      if (isElectron) {
        return await this.loginWithElectron(credentials);
      }

      // Use database service for web authentication
      return await this.loginWithDatabase(credentials);

    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed'
      };
    }
  }

  /**
   * Login using Electron native database
   */
  private async loginWithElectron(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const user = await (window as any).electronAPI.auth.login(credentials);
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }

      return {
        success: true,
        user: this.normalizeUser(user)
      };
    } catch (error) {
      console.error('Electron login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Login using database service (Supabase, LocalStorage, etc.)
   */
  private async loginWithDatabase(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const { username, password } = credentials;

      // Try to find user in employees table first
      let user = await this.findUserInTable('employees', username);
      
      // If not found in employees, try users table
      if (!user) {
        user = await this.findUserInTable('users', username);
      }

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Check if user is active
      if (user.status && user.status !== 'Active') {
        return {
          success: false,
          error: 'Account is not active'
        };
      }

      if (user.is_active === false) {
        return {
          success: false,
          error: 'Account is not active'
        };
      }

      // Verify password
      const passwordMatch = await this.verifyPassword(password, user.password || '');
      
      if (!passwordMatch) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      return {
        success: true,
        user: this.normalizeUser(user)
      };

    } catch (error) {
      console.error('Database login error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Find user in specific table
   */
  private async findUserInTable(table: string, username: string): Promise<any> {
    try {
      const users = await databaseService.query(table, {
        where: { username },
        limit: 1
      });
      
      return users.length > 0 ? users[0] : null;
    } catch (error) {
      console.error(`Error finding user in ${table}:`, error);
      return null;
    }
  }

  /**
   * Verify password (handle both hashed and plain text)
   */
  private async verifyPassword(password: string, storedPassword: string): Promise<boolean> {
    try {
      // If stored password looks like a hash (starts with $2a$ or $2b$)
      if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
        return await bcrypt.compare(password, storedPassword);
      }
      
      // For plain text passwords (development/demo mode)
      return password === storedPassword;
    } catch (error) {
      console.error('Password verification error:', error);
      return false;
    }
  }

  /**
   * Normalize user object to standard format
   */
  private normalizeUser(user: any): User {
    return {
      id: user.id || user.user_id,
      username: user.username,
      email: user.email,
      nama: user.nama || user.name || user.full_name,
      role: user.role || 'User',
      status: user.status || 'Active',
      is_active: user.is_active !== false,
      created_at: user.created_at,
      updated_at: user.updated_at
    };
  }

  /**
   * Create default admin user (for first-time setup)
   */
  async createDefaultAdmin(): Promise<User> {
    const adminUser = {
      username: 'admin',
      password: 'admin123', // Plain text for demo
      email: 'admin@studio-pos.com',
      nama: 'Administrator',
      role: 'Administrator',
      status: 'Active',
      is_active: true
    };

    try {
      // Try to create in employees table first
      const createdUser = await databaseService.create('employees', adminUser);
      return this.normalizeUser(createdUser);
    } catch (error) {
      console.error('Error creating default admin:', error);
      // Return mock user if creation fails
      return this.normalizeUser(adminUser);
    }
  }

  /**
   * Check if user exists
   */
  async userExists(username: string): Promise<boolean> {
    try {
      const user = await this.findUserInTable('employees', username) || 
                   await this.findUserInTable('users', username);
      return !!user;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  /**
   * Get current user from session storage
   */
  getCurrentUser(): User | null {
    try {
      const userStr = sessionStorage.getItem('current_user') || 
                     localStorage.getItem('azuro_user');
      
      if (userStr) {
        return JSON.parse(userStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  /**
   * Save user to session storage
   */
  saveUser(user: User): void {
    try {
      sessionStorage.setItem('current_user', JSON.stringify(user));
      localStorage.setItem('azuro_user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  /**
   * Clear user from session storage
   */
  clearUser(): void {
    try {
      sessionStorage.removeItem('current_user');
      localStorage.removeItem('azuro_user');
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    this.clearUser();
    
    // If running in Electron, notify main process
    if (typeof window !== 'undefined' && (window as any).electronAPI?.auth?.logout) {
      try {
        await (window as any).electronAPI.auth.logout();
      } catch (error) {
        console.error('Electron logout error:', error);
      }
    }
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  /**
   * Get user role
   */
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this.getUserRole();
    return roles.includes(userRole || '');
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();


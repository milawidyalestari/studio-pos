/**
 * Studio POS - Database Migration Status Component
 * Description: Component untuk menampilkan status database migration
 * Date: 2025-01-01
 * Version: 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2, Database, AlertTriangle } from 'lucide-react';
import { DatabaseMigrationService, MigrationStatus } from '../services/DatabaseMigrationService';
import { TransparentWrapper } from './TransparentWrapper';

interface DatabaseMigrationStatusProps {
  onMigrationComplete?: (status: MigrationStatus) => void;
  onMigrationError?: (error: string) => void;
}

export const DatabaseMigrationStatus: React.FC<DatabaseMigrationStatusProps> = ({
  onMigrationComplete,
  onMigrationError
}) => {
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const migrationService = DatabaseMigrationService.getInstance();

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const checkDatabaseStatus = async () => {
    try {
      setIsLoading(true);
      const status = await migrationService.checkDatabaseStatus();
      setMigrationStatus(status);
      
      if (status.isSetup) {
        onMigrationComplete?.(status);
      }
    } catch (error) {
      console.error('Database status check failed:', error);
      onMigrationError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupDatabase = async () => {
    try {
      setIsSettingUp(true);
      const status = await migrationService.setupDatabase();
      setMigrationStatus(status);
      
      if (status.isSetup) {
        onMigrationComplete?.(status);
      } else {
        onMigrationError?.(status.error || 'Database setup failed');
      }
    } catch (error) {
      console.error('Database setup failed:', error);
      onMigrationError?.(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSettingUp(false);
    }
  };

  const getStatusIcon = () => {
    if (isLoading || isSettingUp) {
      return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
    }
    
    if (migrationStatus?.isSetup) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    if (migrationStatus?.error) {
      return <XCircle className="w-6 h-6 text-red-500" />;
    }
    
    return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isLoading) return 'Checking database status...';
    if (isSettingUp) return 'Setting up database...';
    if (migrationStatus?.isSetup) return 'Database ready!';
    if (migrationStatus?.error) return 'Database setup failed';
    return 'Database needs setup';
  };

  const getStatusColor = () => {
    if (isLoading || isSettingUp) return 'text-blue-600';
    if (migrationStatus?.isSetup) return 'text-green-600';
    if (migrationStatus?.error) return 'text-red-600';
    return 'text-yellow-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Checking database status...</p>
        </div>
      </div>
    );
  }

  return (
    <TransparentWrapper>
      <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-800">Database Status</h2>
        </div>
        {getStatusIcon()}
      </div>

      <div className="mb-6">
        <p className={`text-lg font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        
        {migrationStatus?.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">Error Details:</p>
            <p className="text-red-600 text-sm mt-1">{migrationStatus.error}</p>
          </div>
        )}
      </div>

      {migrationStatus?.steps && migrationStatus.steps.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Setup Steps:</h3>
          <div className="space-y-2">
            {migrationStatus.steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">{step}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {!migrationStatus?.isSetup && !migrationStatus?.error && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <p className="font-medium text-yellow-800">Database Setup Required</p>
            </div>
            <p className="text-yellow-700 text-sm">
              Studio POS needs to set up the database before it can run. 
              This will create all necessary tables and default data.
            </p>
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        {!migrationStatus?.isSetup && !migrationStatus?.error && (
          <button
            onClick={handleSetupDatabase}
            disabled={isSettingUp}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            {isSettingUp ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                <span>Setup Database</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={checkDatabaseStatus}
          disabled={isLoading}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Database className="w-5 h-5" />
          <span>Refresh Status</span>
        </button>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {showDetails && migrationStatus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3">Connection Details:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Host:</span>
              <span className="font-mono">{migrationStatus.connectionInfo.host}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Port:</span>
              <span className="font-mono">{migrationStatus.connectionInfo.port}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Database:</span>
              <span className="font-mono">{migrationStatus.connectionInfo.database}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Username:</span>
              <span className="font-mono">{migrationStatus.connectionInfo.username}</span>
            </div>
          </div>
        </div>
      )}
      </div>
    </TransparentWrapper>
  );
};

export default DatabaseMigrationStatus;

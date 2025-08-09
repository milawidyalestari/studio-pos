
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgramSettings } from './ProgramSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { ProgramTools } from './ProgramTools';
import { UserSettings } from './UserSettings';
import HardwareSettings from './HardwareSettings';
import MigrationWizard from '../MigrationWizard';
import { DataMigration } from '../DataMigration';
import { NotaSettings } from './NotaSettings';
import { useHasAccess } from '@/context/RoleAccessContext';

export const SettingsTabs = () => {
  const hasAccess = useHasAccess();

  // Helper function to get grid columns based on visible tabs
  const getTabGridCols = () => {
    let count = 0;
    if (hasAccess('Settings', 'program_settings')) count++;
    if (hasAccess('Settings', 'database_settings')) count++;
    if (hasAccess('Settings', 'hardware_settings')) count++;
    if (hasAccess('Settings', 'system_tools')) count++; // tools
    if (hasAccess('Settings', 'user_management')) count++;
    if (hasAccess('Settings', 'system_tools')) count++; // nota
    if (hasAccess('Settings', 'system_tools')) count++; // migration
    
    // Dynamic grid calculation based on actual tab count
    if (count >= 7) return 'grid-cols-7';
    if (count >= 6) return 'grid-cols-6';
    if (count >= 5) return 'grid-cols-5';
    if (count >= 4) return 'grid-cols-4';
    if (count >= 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  // Determine first accessible tab
  const getFirstAccessibleTab = () => {
    if (hasAccess('Settings', 'program_settings')) return 'program';
    if (hasAccess('Settings', 'database_settings')) return 'database';
    if (hasAccess('Settings', 'hardware_settings')) return 'hardware';
    if (hasAccess('Settings', 'system_tools')) return 'tools';
    if (hasAccess('Settings', 'user_management')) return 'users';
    return 'program'; // fallback
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <Tabs defaultValue={getFirstAccessibleTab()} className="w-full">
        <TabsList className={`grid w-full ${getTabGridCols()}`}>
          {hasAccess('Settings', 'program_settings') && (
            <TabsTrigger value="program">Program</TabsTrigger>
          )}
          {hasAccess('Settings', 'database_settings') && (
            <TabsTrigger value="database">Database</TabsTrigger>
          )}
          {hasAccess('Settings', 'hardware_settings') && (
            <TabsTrigger value="hardware">Hardware</TabsTrigger>
          )}
          {hasAccess('Settings', 'system_tools') && (
            <TabsTrigger value="tools">Tools</TabsTrigger>
          )}
          {hasAccess('Settings', 'user_management') && (
            <TabsTrigger value="users">Users</TabsTrigger>
          )}
          {hasAccess('Settings', 'system_tools') && (
            <TabsTrigger value="nota">Nota</TabsTrigger>
          )}
          {hasAccess('Settings', 'system_tools') && (
            <TabsTrigger value="migration">Migration</TabsTrigger>
          )}
        </TabsList>

        {hasAccess('Settings', 'program_settings') && (
          <TabsContent value="program" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Program Settings</CardTitle>
                <CardDescription>
                  General configurations for how the application operates.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramSettings />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasAccess('Settings', 'database_settings') && (
          <TabsContent value="database" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Database Settings</CardTitle>
                <CardDescription>
                  Configuration options for managing database connections and parameters.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DatabaseSettings />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasAccess('Settings', 'hardware_settings') && (
          <TabsContent value="hardware" className="space-y-4">
            <HardwareSettings />
          </TabsContent>
        )}

        {hasAccess('Settings', 'system_tools') && (
          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Program Tools</CardTitle>
                <CardDescription>
                  Auxiliary tools and utilities that support the core functionality.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProgramTools />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasAccess('Settings', 'user_management') && (
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <CardDescription>
                  Settings related to user management, roles, and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSettings />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasAccess('Settings', 'system_tools') && (
          <TabsContent value="nota" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Nota Settings</CardTitle>
                <CardDescription>
                  Customize header, logo, and footer for Nota prints.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NotaSettings />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasAccess('Settings', 'system_tools') && (
          <TabsContent value="migration" className="space-y-4">
            <DataMigration />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};


import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgramSettings } from './ProgramSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { UserSettings } from './UserSettings';
import { StrukSettings } from './StrukSettings';
import { useHasAccess } from '@/context/RoleAccessContext';

export const SettingsTabs = () => {
  const hasAccess = useHasAccess();

  // Helper function to get grid columns based on visible tabs
  const getTabGridCols = () => {
    let count = 0;
    if (hasAccess('Settings', 'program_settings')) count++;
    if (hasAccess('Settings', 'database_settings')) count++;
    if (hasAccess('Settings', 'user_management')) count++;
    if (hasAccess('Settings', 'system_tools')) count++; // nota
    
    // Dynamic grid calculation based on actual tab count
    if (count >= 4) return 'grid-cols-4';
    if (count >= 3) return 'grid-cols-3';
    return 'grid-cols-2';
  };

  // Determine first accessible tab
  const getFirstAccessibleTab = () => {
    if (hasAccess('Settings', 'program_settings')) return 'program';
    if (hasAccess('Settings', 'database_settings')) return 'database';
    if (hasAccess('Settings', 'user_management')) return 'users';
    if (hasAccess('Settings', 'system_tools')) return 'nota';
    return 'program'; // fallback
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola pengaturan aplikasi dan preferensi Anda.
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
          {hasAccess('Settings', 'user_management') && (
            <TabsTrigger value="users">Users</TabsTrigger>
          )}
          {hasAccess('Settings', 'system_tools') && (
            <TabsTrigger value="nota">Struk</TabsTrigger>
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



        {hasAccess('Settings', 'user_management') && (
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pengaturan User</CardTitle>
                <CardDescription>
                  Pengaturan terkait manajemen pengguna, peran, dan hak akses.
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
            <StrukSettings />
          </TabsContent>
        )}

      </Tabs>
    </div>
  );
};

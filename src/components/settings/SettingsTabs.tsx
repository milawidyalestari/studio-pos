
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgramSettings } from './ProgramSettings';
import { DatabaseSettings } from './DatabaseSettings';
import { ProgramTools } from './ProgramTools';
import { UserSettings } from './UserSettings';
import HardwareSettings from './HardwareSettings';
import DatabaseTest from '../DatabaseTest';
import MigrationWizard from '../MigrationWizard';
import DatabaseDebug from '../DatabaseDebug';
import { NotaSettings } from './NotaSettings';

export const SettingsTabs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="program" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="program">Program</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="nota">Nota</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="debug">Debug</TabsTrigger>
        </TabsList>

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

        <TabsContent value="hardware" className="space-y-4">
          <HardwareSettings />
        </TabsContent>

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

        <TabsContent value="test" className="space-y-4">
          <DatabaseTest />
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <MigrationWizard />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <DatabaseDebug />
        </TabsContent>
      </Tabs>
    </div>
  );
};

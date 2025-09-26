"use client";

import { Settings, Trash2 } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          breadcrumbs={[
            {
              label: "Settings",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            {/* Page Title */}
            <div>
              <h1 className="text-xl font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Configure your visitor registration system
              </p>
            </div>

            {/* General Settings */}
            <Card>
              <CardHeader className="flex flex-row items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Organization Name</p>
                    <p className="text-sm text-muted-foreground">
                      Museum of Natural History
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Time Zone</p>
                    <p className="text-sm text-muted-foreground">
                      UTC-5 (Eastern Time)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Default Language</p>
                    <p className="text-sm text-muted-foreground">English</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Data Retention</p>
                    <p className="text-sm text-muted-foreground">12 months</p>
                  </div>
                </div>
                <div className="flex justify-end border-t pt-4">
                  <Button>Save Settings</Button>
                </div>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card>
              <CardHeader>
                <CardTitle>Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 rounded-md border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Delete Account
                    </p>
                    <p className="text-sm text-red-500">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button variant="destructive" className="mt-2 sm:mt-0">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

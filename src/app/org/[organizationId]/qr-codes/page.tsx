"use client";

import { Copy, Download } from 'lucide-react';

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
              label: "QR Codes",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6">
            {/* Page Title */}
            <div>
              <h1 className="text-xl font-semibold">QR Codes</h1>
              <p className="text-sm text-muted-foreground">
                Manage QR codes for visitor registration and feedback
              </p>
            </div>

            {/* First Row: Registration + Exit Survey */}
            <div className="grid gap-4 xl:grid-cols-2">
              {/* Registration Entry */}
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <span className="text-2xl">📷</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-medium">Registration Entry</h3>
                    <p className="text-sm text-muted-foreground">
                      Place at entrance for visitor registration
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      https://07eecfa9.../register
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="self-end rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                      registration
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-1" /> Copy URL
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" /> Download QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Exit Survey */}
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <span className="text-2xl">📷</span>
                  </div>
                  <div className="flex flex-col flex-1">
                    <h3 className="font-medium">Exit Survey</h3>
                    <p className="text-sm text-muted-foreground">
                      Place at exit for feedback collection
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      https://07eecfa9.../exit-survey
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="self-end rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                      exit
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-1" /> Copy URL
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" /> Download QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second Row: Small Cards */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                    <span className="text-xl">📷</span>
                  </div>
                  <h3 className="font-medium">Registration QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Print and place at your entrance for easy visitor
                    registration
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                    <span className="text-xl">📷</span>
                  </div>
                  <h3 className="font-medium">Exit Survey QR Code</h3>
                  <p className="text-sm text-muted-foreground">
                    Collect valuable feedback as visitors leave your venue
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

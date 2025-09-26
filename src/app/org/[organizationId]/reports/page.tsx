"use client";

import { CheckCircle, Download } from 'lucide-react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
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
              label: "Reportes",
            },
          ]}
        />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-xl">Reportes</div>
                  <div className="text-muted-foreground text-sm">
                    Download visitor registration data in your preferred format
                  </div>
                </div>
              </div>

              {/* Main Grid */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Date Range */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Date Range</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="dd/mm/yyyy" type="date" />
                        <Input placeholder="dd/mm/yyyy" type="date" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Leave empty to export all data
                      </p>
                    </CardContent>
                  </Card>

                  {/* Fields to Include */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Fields to Include</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                      {[
                        "Name",
                        "Email",
                        "City",
                        "Visit Date",
                        "People Count",
                        "Created At",
                      ].map((field, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox defaultChecked={field !== "Created At"} />
                          {field}
                        </label>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Export Format */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Format</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Select defaultValue="excel">
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button className="w-full">Export Data</Button>
                    </CardContent>
                  </Card>

                  {/* Export Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Export Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-1">
                      <div>
                        Format: <span className="font-medium">Excel</span>
                      </div>
                      <div>
                        Fields: <span className="font-medium">6 selected</span>
                      </div>
                      <div>
                        Date Range:{" "}
                        <span className="font-medium">All Time</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recent Exports */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Exports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {[
                        { name: "Excel Export", time: "2 hours ago" },
                        { name: "PDF Report", time: "Yesterday" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {item.time}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

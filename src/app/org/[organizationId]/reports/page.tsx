"use client";

import { useParams } from 'next/navigation';
import { useState } from 'react';

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
import { supabase } from '@/lib/supabase';

export default function Page() {
  const allFields = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "city", label: "City" },
    { key: "state", label: "State" },
    { key: "country", label: "Country" },
    { key: "visit_date", label: "Visit Date" },
    { key: "people_count", label: "People Count" },
    { key: "created_at", label: "Created At" },
  ];

  const params = useParams();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<string[]>(
    allFields.map((f) => f.key)
  );
  const [format, setFormat] = useState<"csv" | "xlsx">("csv");
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (selectedFields.length === 0) {
      alert("Select at least one field to export");
      return;
    }

    setLoading(true);

    try {
      // Get the session token of the current logged-in user
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError || !session) throw new Error("User not authenticated");

      const token = session.access_token;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export-visitors`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // <-- use user token, not anon key
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startDate: startDate || null,
            endDate: endDate || null,
            fields: selectedFields,
            format,
            orgId: params.organizationId?.toString(),
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to generate report");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
        now.getDate()
      )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
        now.getSeconds()
      )}`;
      const ext = format === "xlsx" ? "xlsx" : "csv";

      const a = document.createElement("a");
      a.href = url;
      a.download = `Visitors_${timestamp}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error exporting data");
    } finally {
      setLoading(false);
    }
  }

  function toggleField(key: string) {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

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
        <SiteHeader breadcrumbs={[{ label: "Reportes" }]} />
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
                        <Input
                          placeholder="dd/mm/yyyy"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                        <Input
                          placeholder="dd/mm/yyyy"
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                        />
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
                      {allFields.map((f) => (
                        <label
                          key={f.key}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Checkbox
                            checked={selectedFields.includes(f.key)}
                            onCheckedChange={() => toggleField(f.key)}
                          />
                          {f.label}
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
                      <Select
                        value={format}
                        onValueChange={(v) => setFormat(v as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        className="w-full"
                        onClick={handleExport}
                        disabled={loading}
                      >
                        {loading ? "Generating..." : "Export Data"}
                      </Button>
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

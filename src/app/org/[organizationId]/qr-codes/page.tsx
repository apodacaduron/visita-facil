"use client";

import { Copy, Download, ExternalLink, QrCode } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page() {
  const params = useParams();
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    // Runs only on the client
    if (typeof window !== "undefined" && params.organizationId) {
      setBaseUrl(`${window.location.origin}/p/o/${params.organizationId}`);
    }
  }, [params.organizationId]);

  const qrCards = [
    {
      title: "Registration Entry",
      description: "Place at entrance for visitor registration",
      url: `${baseUrl}/register`,
      badge: "registration",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Exit Survey",
      description: "Place at exit for feedback collection",
      url: `${baseUrl}/exit`,
      badge: "exit",
      badgeColor: "bg-gray-100 text-gray-700",
    },
  ];

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader
          breadcrumbs={[{ label: "QR Codes" }]}
        />

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold">QR Codes</h1>
            <p className="text-sm text-muted-foreground">
              Manage QR codes for visitor registration and feedback
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {qrCards.map((card) => (
              <Card key={card.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex items-center gap-4 p-4 border-b">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{card.description}</p>
                  </div>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 p-4">
                  <p className="text-xs text-muted-foreground truncate">{card.url}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => navigator.clipboard.writeText(card.url)}
                    >
                      <Copy className="h-4 w-4" /> Copy URL
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => window.open(card.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" /> Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" /> Download QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

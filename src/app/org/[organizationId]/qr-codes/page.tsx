"use client";

import { Copy, Download, ExternalLink, Eye, QrCode } from 'lucide-react';
import { useParams } from 'next/navigation';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';

import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

export default function Page() {
  const params = useParams();
  const [baseUrl, setBaseUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && params.organizationId) {
      setBaseUrl(`${window.location.origin}/p/o/${params.organizationId}`);
    }
  }, [params.organizationId]);

  const qrCards = [
    {
      title: "Registro de Entrada",
      description:
        "Coloca este código en la entrada para que los visitantes se registren",
      url: `${baseUrl}/register`,
      badge: "entrada",
      badgeColor: "bg-blue-100 text-blue-700",
    },
    {
      title: "Encuesta de Salida",
      description:
        "Coloca este código en la salida para recopilar comentarios",
      url: `${baseUrl}/exit`,
      badge: "salida",
      badgeColor: "bg-gray-100 text-gray-700",
    },
  ];

  const downloadQRCode = async (url: string, name: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${name.replace(/\s+/g, "_")}_QR.png`;
      a.click();
    } catch (err) {
      console.error("No se pudo generar el código QR:", err);
    }
  };

  const previewQRCode = async (url: string) => {
    try {
      const dataUrl = await QRCode.toDataURL(url, { width: 500, margin: 2 });
      setPreviewUrl(dataUrl);
    } catch (err) {
      console.error("No se pudo mostrar la vista previa del QR:", err);
    }
  };

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader breadcrumbs={[{ label: "Códigos QR" }]} />

        <div className="flex flex-1 flex-col gap-6 p-6">
          <div>
            <h1 className="text-2xl font-semibold">Códigos QR</h1>
            <p className="text-sm text-muted-foreground">
              Administra los códigos QR para el registro de visitantes y encuestas de salida
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {qrCards.map((card) => (
              <Card
                key={card.title}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="flex items-center gap-4 p-4 border-b">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </div>
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-medium ${card.badgeColor}`}
                  >
                    {card.badge}
                  </span>
                </CardHeader>

                <CardContent className="flex flex-col gap-2 p-4">
                  <p className="text-xs text-muted-foreground truncate">
                    {card.url}
                  </p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => navigator.clipboard.writeText(card.url)}
                    >
                      <Copy className="h-4 w-4" /> Copiar URL
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => window.open(card.url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" /> Abrir
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => downloadQRCode(card.url, card.title)}
                    >
                      <Download className="h-4 w-4" /> Descargar QR
                    </Button>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-1"
                          onClick={() => previewQRCode(card.url)}
                        >
                          <Eye className="h-4 w-4" /> Vista previa
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Vista previa: {card.title}</DialogTitle>
                        </DialogHeader>
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt={`${card.title} QR`}
                            className="w-full h-auto"
                          />
                        )}
                      </DialogContent>
                    </Dialog>
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

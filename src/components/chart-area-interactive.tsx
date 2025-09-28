"use client";

import { useParams } from 'next/navigation';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import {
    Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import {
    ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent
} from '@/components/ui/chart';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch chart data from Supabase RPC
async function fetchChartData(orgId: string, daysBack: number) {
  const { data, error } = await supabase.rpc("visitors_daily", {
    org_id: orgId,
    days_back: daysBack,
  });

  if (error) throw error;

interface VisitorData {
  visit_date: string;
  count: number;
}

  return data.map((item: VisitorData) => ({
    date: item.visit_date,
    visitors: item.count,
  }));
}

const chartConfig = {
  visitors: { label: "Visitors", color: "var(--primary)" },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
  const params = useParams();
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("90d");

  React.useEffect(() => {
    if (isMobile) setTimeRange("7d");
  }, [isMobile]);

  const daysBack = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;

  const {
    data: chartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["visitorsChart", params.organizationId?.toString(), daysBack],
    queryFn: () => {
      const orgId = params.organizationId?.toString();
      if (!orgId)
        throw new Error(
          "No organization id provided, could not fetch stat cards"
        );
      return fetchChartData(orgId, daysBack);
    },
    enabled: !!params.organizationId?.toString(),
  });

  const filteredData = chartData ?? [];

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Total de visitantes</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Total de los últimos 3 meses
          </span>
          <span className="@[540px]/card:hidden">Últimos 3 meses</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
            <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
            <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
          </ToggleGroup>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Seleccionar un rango"
            >
              <SelectValue placeholder="Últimos 3 meses" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Últimos 3 meses
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Últimos 30 días
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Últimos 7 días
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            Cargando gráfico…
          </div>
        ) : isError ? (
          <div className="h-[250px] flex items-center justify-center text-red-500">
            Error al cargar el gráfico
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-visitors)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : Math.floor(daysBack / 2)}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="visitors"
                type="natural"
                fill="url(#fillVisitors)"
                stroke="var(--color-visitors)"
                stackId="a"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

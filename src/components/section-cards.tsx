"use client";

import { useParams } from 'next/navigation';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { createClient } from '@supabase/supabase-js';
import { useQuery } from '@tanstack/react-query';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchStats(orgId: string) {
  const { data: today } = await supabase.rpc("visitors_today", {
    org_id: orgId,
  });
  const { data: week } = await supabase.rpc("visitors_this_week", {
    org_id: orgId,
  });
  const { data: month } = await supabase.rpc("visitors_this_month", {
    org_id: orgId,
  });
  const { data: peopleMonth } = await supabase.rpc("people_this_month", {
    org_id: orgId,
  });

  return {
    today: today ?? 0,
    week: week ?? 0,
    month: month ?? 0,
    peopleMonth: peopleMonth ?? 0,
  };
}

export function SectionCards() {
  const params = useParams();

  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stats", params.organizationId?.toString()],
    queryFn: () => {
      const orgId = params.organizationId?.toString();
      if (!orgId)
        throw new Error(
          "No organization id provided, could not fetch stat cards"
        );
      return fetchStats(orgId);
    },
    enabled: !!params.organizationId?.toString(),
  });

  const renderCard = (title: string, value: number | null) => (
    <Card className="gap-2">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {isLoading ? <Skeleton className="h-8 w-24" /> : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );

  if (isError)
    return <div className="p-4 text-red-500">Error al cargar estadísticas</div>;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {renderCard("Visitantes hoy", stats?.today ?? null)}
      {renderCard("Visitantes esta semana", stats?.week ?? null)}
      {renderCard("Visitantes este mes", stats?.month ?? null)}
      {renderCard("Personas totales este mes", stats?.peopleMonth ?? null)}
    </div>
  );
}

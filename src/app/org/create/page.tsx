"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CreateOrganizationForm from '@/features/organizations/components/CreateOrganizationForm';
import { cn } from '@/lib/utils';

export default function CreateOrganizationPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-xl">Registra tu institución</CardTitle>
              <CardDescription>
                Una organización representa a tu museo o institución. Aquí
                podrás llevar el control de tus visitantes y reportes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateOrganizationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Crea una organización</CardTitle>
              <CardDescription>
                Elige un nombre para identificar tu organización
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
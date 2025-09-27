"use client";

import { GalleryVerticalEnd, Loader2Icon, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';

const exitSchema = z.object({
  exit_feedback: z.string().nullable(),
  exit_rating: z.number().min(0).max(5).nullable(),
});
type ExitSchema = z.infer<typeof exitSchema>;

export default function ExitPage() {
  const params = useParams();
  const [submitted, setSubmitted] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const form = useForm<ExitSchema>({
    resolver: zodResolver(exitSchema),
    defaultValues: { exit_feedback: "", exit_rating: null },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExitSchema) => {
      const visitorId = getVisitorId();
      const organization_id = params.organizationId?.toString();
      if (!organization_id) throw new Error("Organization id not provided");
      const exited_at = new Date().toISOString()

      if (visitorId) {
        return supabase
          .from("visitors")
          .update({ ...data, exited_at, organization_id })
          .eq("id", visitorId);
      } else {
        return supabase
          .from("visitors")
          .insert({ ...data, name: "unknown", exited_at, people_count: 1, organization_id });
      }
    },
    onSuccess() {
      toast.success("¡Gracias por tu retroalimentación!");
      form.reset();
      setSubmitted(true);
    },
    onError(error) {
      toast.error("No se pudo guardar tu respuesta", {
        description: error.message,
      });
    },
  });

  async function onSubmit(data: ExitSchema) {
    await createMutation.mutateAsync(data);
  }

  function getVisitorId(): string | null {
    const raw = localStorage.getItem("visitor_session");
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      if (Date.now() < data.expiresAt) return data.id;
      localStorage.removeItem("visitor_session");
    } catch {
      localStorage.removeItem("visitor_session");
    }
    return null;
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="h-4 w-4" />
          </div>
          Acme Inc.
        </a>

        <div className={cn("flex flex-col gap-6")}>
          <Card>
            {!submitted ? (
              <>
                <CardHeader className="text-center">
                  <CardTitle className="text-xl">Antes de salir</CardTitle>
                  <CardDescription>
                    Cuéntanos cómo fue tu experiencia
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-4 pt-2"
                    >
                      {/* Star Rating */}
                      <FormField
                        control={form.control}
                        name="exit_rating"
                        render={({ field }) => (
                          <FormItem className='justify-center mb-8'>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star
                                  key={i}
                                  className={cn(
                                    "size-10 cursor-pointer transition-colors",
                                    (hoverRating ?? field.value ?? 0) >= i
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  )}
                                  onMouseEnter={() => setHoverRating(i)}
                                  onMouseLeave={() => setHoverRating(null)}
                                  onClick={() => field.onChange(i)}
                                />
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      {/* Feedback */}
                      <FormField
                        control={form.control}
                        name="exit_feedback"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tu comentario</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Escribe aquí tu opinión..."
                                {...field}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full mt-4"
                        disabled={form.formState.isSubmitting}
                      >
                        {form.formState.isSubmitting && (
                          <Loader2Icon className="animate-spin mr-2" />
                        )}
                        Enviar
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </>
            ) : (
              <CardContent>
                <div className="flex flex-col items-center gap-4 py-6">
                  <h2 className="text-xl font-semibold">🙌 ¡Gracias!</h2>
                  <p className="text-muted-foreground text-center">
                    Tu comentario y calificación han sido registrados. <br />
                    Nos ayuda a mejorar tu próxima visita.
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

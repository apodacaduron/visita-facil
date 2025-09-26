"use client";

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Loader2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { DialogProps } from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Visitor } from './VisitorsTable';

dayjs.extend(utc)
const visitorSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .or(z.literal("")),
  people_count: z.number().int().nullable(),
  city: z.string().nullable(),
  visit_date: z
    .string()
    .min(1, { message: "La fecha de visita es obligatoria" }),
});

type VisitorSchema = z.infer<typeof visitorSchema>;

type Props = {
  onSuccess?: () => void;
  item: Visitor | null;
  dialogProps: DialogProps;
  queryKeyGetter(): unknown[];
};

export default function VisitorForm(props: Props) {
  const params = useParams();
  const queryClient = useQueryClient();

  const form = useForm<VisitorSchema>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: props.item?.name ?? "",
      email: props.item?.email ?? "",
      people_count: props.item?.people_count ?? 1, // default to 1
      city: props.item?.city ?? "", // default to empty string
      visit_date: dayjs(props.item?.visit_date ?? new Date()).format(
        "YYYY-MM-DDTHH:mm"
      ),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: VisitorSchema) => {
      const organization_id = params.organizationId?.toString();
      if (!organization_id)
        throw new Error(
          "Organization id not provided, could not create new visitor"
        );

      return supabase.from("visitors").insert({
        ...data,
        visit_date: dayjs(data.visit_date)
          .utc() // interpret as local, convert to UTC
          .toISOString(),
        organization_id,
      });
    },
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: props.queryKeyGetter() });
      toast.success("¡Visitante agregado!", {
        description: variables.name,
      });
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("No se pudo agregar al visitante", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VisitorSchema) => {
      const organization_id = params.organizationId?.toString();
      if (!organization_id)
        throw new Error(
          "Organization id not provided, could not create new visitor"
        );
      if (!props.item?.id)
        throw new Error(
          "No se pudo actualizar el visitante, no se proporcionó un ID"
        );

      return supabase
        .from("visitors")
        .update({
          ...data,
          visit_date: dayjs(data.visit_date)
            .utc() // interpret as local, convert to UTC
            .toISOString(),
          organization_id,
        })
        .eq("id", props.item.id)
        .throwOnError();
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitante actualizado");
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("No se pudo actualizar al visitante", {
        description: error.message,
      });
    },
  });

  async function onSubmit(data: VisitorSchema) {
    const isUpdating = Boolean(props.item?.id);

    if (isUpdating) {
      await updateMutation.mutateAsync(data);
    } else {
      await createMutation.mutateAsync(data);
    }
  }

  useEffect(() => {
    form.reset({
      name: props.item?.name ?? "",
      email: props.item?.email ?? "",
      people_count: props.item?.people_count ?? 1,
      city: props.item?.city ?? "",
      visit_date: dayjs(props.item?.visit_date ?? new Date()).format(
        "YYYY-MM-DDTHH:mm"
      ),
    });
  }, [props.item, form]);

  return (
    <Dialog {...props.dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.item?.id
              ? "Actualizar visitante"
              : "Agregar nuevo visitante"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nombre<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre del visitante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="visitante@ejemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="people_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Cantidad de personas<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Cantidad de personas"
                      {...field}
                      value={field.value ?? ""} // always a string, never undefined
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? null : Number(e.target.value)
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visit_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Fecha de visita<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
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
                <Loader2Icon className="animate-spin" />
              )}
              Guardar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

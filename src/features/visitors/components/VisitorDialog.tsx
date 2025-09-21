"use client";

import { Loader2Icon } from 'lucide-react';
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

const visitorSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.email({ message: "Invalid email address" }).or(z.literal("")),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .regex(/^\d+$/, { message: "Phone number must contain only digits" })
    .or(z.literal("")),
});

type VisitorSchema = z.infer<typeof visitorSchema>;

type Props = {
  onSuccess?: () => void;
  item: Visitor | null;
  dialogProps: DialogProps;
  queryKeyGetter(): unknown[];
};

export default function VisitorForm(props: Props) {
  const queryClient = useQueryClient();

  const form = useForm<VisitorSchema>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: props.item?.name ?? "",
      email: props.item?.email ?? "",
      phone: props.item?.phone ?? "",
    },
  });
  const createMutation = useMutation({
    mutationFn: async (data: VisitorSchema) => {
      return supabase.from("visitors").insert(data).throwOnError();
    },
    async onSuccess(_, variables) {
      await queryClient.invalidateQueries({ queryKey: props.queryKeyGetter() });
      toast.success("Client added!", {
        description: variables.name,
      });
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to add visitor", {
        description: error.message,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VisitorSchema) => {
      if (!props.item?.id)
        throw new Error("Could not update visitor, id was not provided");

      return supabase
        .from("visitors")
        .update(data)
        .eq("id", props.item.id)
        .throwOnError();
    },
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Client updated");
      form.reset();
      props.onSuccess?.();
    },
    onError(error) {
      toast.error("Failed to update visitor", {
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
      phone: props.item?.phone ?? "",
    });
  }, [props.item, form]);

  return (
    <Dialog {...props.dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {props.item?.id ? "Update visitor" : "Add new visitor"}
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Client name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="visitor@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="Visitor phone" {...field} />
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
              {form.formState.isSubmitting && <Loader2Icon className="animate-spin" />}
              Save
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

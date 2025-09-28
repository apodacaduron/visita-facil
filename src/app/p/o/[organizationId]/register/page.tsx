"use client";

import { Check, ChevronsUpDown, GalleryVerticalEnd, Loader2Icon } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from '@/components/ui/command';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';

const visitorSchema = z.object({
  name: z.string().min(1, { message: "El nombre es obligatorio" }),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .or(z.literal("")),
  people_count: z.number().int().nullable(),
  city_id: z.int().nullable(),
});
type VisitorSchema = z.infer<typeof visitorSchema>;

export default function Page() {
  const [submitted, setSubmitted] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const debouncedCitySearch = useDebounce(citySearch, 300);
  const params = useParams();
  const form = useForm<VisitorSchema>({
    resolver: zodResolver(visitorSchema),
    defaultValues: {
      name: "",
      email: "",
      people_count: 1, // default to 1
      city_id: null, // default to empty string
    },
  });

  const citysQuery = useQuery({
    queryKey: ["city-search", debouncedCitySearch],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("id, name, state_name, country_name")
        .ilike("name", `%${debouncedCitySearch}%`).limit(10);

      if (error) throw error;
      return data ?? [];
    },
    enabled: cityOpen || !!debouncedCitySearch,
  });

  const selectedCity = useMemo(
    () => citysQuery.data?.find((c) => c.id === form.getValues("city_id")),
    [citysQuery.data, form.watch("city_id")]
  );

  const createMutation = useMutation({
    mutationFn: async (data: VisitorSchema) => {
      const organization_id = params.organizationId?.toString();
      if (!organization_id)
        throw new Error(
          "Organization id not provided, could not create new visitor"
        );

      return await supabase
        .from("visitors")
        .insert({
          ...data,
          organization_id,
        })
        .select()
        .single();
    },
    async onSuccess(response, variables) {
      toast.success("¡Visitante agregado!", {
        description: variables.name,
      });
      // Save visitor id locally
      if (response.data?.id) {
        saveVisitorId(response.data?.id);
      }
      form.reset();
      setSubmitted(true);
    },
    onError(error) {
      toast.error("No se pudo agregar al visitante", {
        description: error.message,
      });
    },
  });

  async function onSubmit(data: VisitorSchema) {
    await createMutation.mutateAsync(data);
  }

  // Save visitor id for 1 day
  function saveVisitorId(visitorId: string) {
    const data = {
      id: visitorId,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 1 day
    };
    localStorage.setItem("visitor_session", JSON.stringify(data));
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </a>
        <div className={cn("flex flex-col gap-6")}>
          <Card>
            {!submitted && (
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Registro de visita</CardTitle>
                <CardDescription>
                  Por favor completa la información para registrar tu entrada
                </CardDescription>
              </CardHeader>
            )}
            <CardContent>
              {!submitted ? (
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
                            Nombre completo
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Escribe tu nombre" {...field} />
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
                          <FormLabel>Correo electrónico (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="ejemplo@correo.com"
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
                            Número de personas
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="¿Cuántas personas vienen contigo?"
                              {...field}
                              value={field.value ?? ""}
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value)
                                )
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City Selector */}
                    <FormField
                      control={form.control}
                      name="city_id"
                      render={() => (
                        <FormItem className="flex flex-col">
                          <FormLabel>City</FormLabel>
                          <Popover open={cityOpen} onOpenChange={setCityOpen}>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className="justify-between w-full"
                                >
                                  {citysQuery.isLoading ? (
                                    <Loader2Icon className="animate-spin mr-2 h-4 w-4" />
                                  ) : selectedCity ? (
                                    `${selectedCity.name}, ${selectedCity.state_name}, ${selectedCity.country_name}`
                                  ) : (
                                    "Select a city"
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-full p-0">
                              <Command>
                                <CommandInput
                                  placeholder="Search city..."
                                  className="h-9"
                                  value={citySearch}
                                  onValueChange={setCitySearch}
                                />
                                <CommandList>
                                  {citysQuery.isLoading ? (
                                    <CommandEmpty>
                                      <div className="flex items-center gap-2">
                                        <Loader2Icon className="animate-spin h-4 w-4" />
                                        Loading cities...
                                      </div>
                                    </CommandEmpty>
                                  ) : (
                                    <>
                                      <CommandEmpty>
                                        No cities found.
                                      </CommandEmpty>
                                      <CommandGroup>
                                        {citysQuery.data?.map((city) => (
                                          <CommandItem
                                            key={city.id}
                                            value={city.name ?? ""}
                                            onSelect={() => {
                                              form.setValue("city_id", city.id);
                                              setCityOpen(false);
                                            }}
                                          >
                                            {`${city.name}, ${city.state_name}, ${city.country_name}`}
                                            <Check
                                              className={cn(
                                                "ml-auto h-4 w-4",
                                                city.id ===
                                                  form.watch("city_id")
                                                  ? "opacity-100"
                                                  : "opacity-0"
                                              )}
                                            />
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </>
                                  )}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
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
                      Registrar visita
                    </Button>
                  </form>
                </Form>
              ) : (
                <div className="flex flex-col items-center gap-4 py-6">
                  <h2 className="text-xl font-semibold">
                    🎉 ¡Gracias por tu visita!
                  </h2>
                  <p className="text-muted-foreground text-center">
                    Tu registro fue exitoso. Disfruta tu recorrido.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-muted-foreground text-center text-xs mt-2">
            Gracias por tu visita 🙌
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings, useUpdateSettings } from "@/lib/hooks/use-settings";
import { settingsSchema, type SettingsInput } from "@/lib/validations/settings";

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings();
  const { mutate: updateSettings, isPending } = useUpdateSettings();

  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      electricityRateKwh: 0.12,
      printerWattage: 200,
      laborRatePerHour: 15,
      defaultPlatformFee: 6.5,
      currencySymbol: "$",
      lowStockThresholdG: 100,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        electricityRateKwh: settings.electricityRateKwh,
        printerWattage: settings.printerWattage,
        laborRatePerHour: settings.laborRatePerHour,
        defaultPlatformFee: settings.defaultPlatformFee,
        currencySymbol: settings.currencySymbol,
        lowStockThresholdG: settings.lowStockThresholdG,
      });
    }
  }, [settings, form]);

  function onSubmit(data: SettingsInput) {
    updateSettings(data, {
      onSuccess: () => toast.success("Settings saved"),
      onError: () => toast.error("Failed to save settings"),
    });
  }

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Settings" description="Configure app defaults" />
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Settings" description="Configure app defaults" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
          {/* Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Costs</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="electricityRateKwh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Electricity Rate ($/kWh)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.001"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="printerWattage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Printer Wattage (W)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="laborRatePerHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Labor Rate ($/hr)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Business */}
          <Card>
            <CardHeader>
              <CardTitle>Business</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="defaultPlatformFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Platform Fee (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencySymbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="$" maxLength={5} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="lowStockThresholdG"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Global Low Stock Threshold (g)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Settings"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

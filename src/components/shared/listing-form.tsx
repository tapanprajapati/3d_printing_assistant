"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ListingCreateSchema, type ListingCreateInput } from "@/lib/validations/listing";

interface ListingFormProps {
  defaultValues?: Partial<ListingCreateInput>;
  onSubmit: (data: ListingCreateInput) => void;
  isPending?: boolean;
  submitLabel?: string;
}

export function ListingForm({
  defaultValues,
  onSubmit,
  isPending,
  submitLabel = "Save",
}: ListingFormProps) {
  const form = useForm<ListingCreateInput>({
    resolver: zodResolver(ListingCreateSchema),
    defaultValues: {
      marketplace: "",
      listingId: "",
      listingUrl: "",
      listedPrice: 0,
      platformFee: undefined,
      status: "DRAFT",
      dateListed: "",
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Marketplace */}
          <FormField
            control={form.control}
            name="marketplace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marketplace</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Etsy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="SOLD_OUT">Sold Out</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Listed Price */}
          <FormField
            control={form.control}
            name="listedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listed Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Platform Fee */}
          <FormField
            control={form.control}
            name="platformFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Platform Fee %{" "}
                  <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step="0.1"
                    placeholder="e.g. 6.5"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? undefined : parseFloat(e.target.value)
                      )
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Listing ID */}
          <FormField
            control={form.control}
            name="listingId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Listing ID{" "}
                  <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 123456789" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date Listed */}
          <FormField
            control={form.control}
            name="dateListed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date Listed{" "}
                  <span className="text-muted-foreground font-normal">optional</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ? field.value.slice(0, 10) : ""} onChange={(e) => {
                    if (!e.target.value) { field.onChange(""); return; }
                    const [y, m, d] = e.target.value.split("-").map(Number);
                    field.onChange(new Date(y, m - 1, d).toISOString());
                  }} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Listing URL */}
        <FormField
          control={form.control}
          name="listingUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Listing URL{" "}
                <span className="text-muted-foreground font-normal">optional</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="https://www.etsy.com/listing/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Notes{" "}
                <span className="text-muted-foreground font-normal">optional</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Any notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}

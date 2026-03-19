"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { ListingStatusBadge } from "@/components/shared/listing-status-badge";
import { ListingForm } from "@/components/shared/listing-form";
import {
  useListings,
  useCreateListing,
  useUpdateListing,
  useDeleteListing,
} from "@/lib/hooks/use-listings";
import { toast } from "sonner";
import type { ListingCreateInput } from "@/lib/validations/listing";

interface MarketplaceListing {
  id: string;
  marketplace: string;
  listingId: string | null;
  listingUrl: string | null;
  listedPrice: number;
  platformFee: number | null;
  status: string;
  dateListed: string | null;
  notes: string | null;
}

interface ListingsTableProps {
  productId: string;
}

export function ListingsTable({ productId }: ListingsTableProps) {
  const { data, isLoading } = useListings(productId);
  const { mutate: createListing, isPending: isCreating } = useCreateListing(productId);
  const { mutate: updateListing, isPending: isUpdating } = useUpdateListing(productId);
  const { mutate: deleteListing, isPending: isDeleting } = useDeleteListing(productId);

  const [addOpen, setAddOpen] = useState(false);
  const [editListing, setEditListing] = useState<MarketplaceListing | null>(null);

  const listings = (data?.data ?? []) as MarketplaceListing[];

  function handleCreate(values: ListingCreateInput) {
    createListing(values, {
      onSuccess: () => {
        toast.success("Listing added");
        setAddOpen(false);
      },
      onError: (err) => toast.error(err.message ?? "Failed to add listing"),
    });
  }

  function handleUpdate(values: ListingCreateInput) {
    if (!editListing) return;
    updateListing(
      { listingId: editListing.id, data: values },
      {
        onSuccess: () => {
          toast.success("Listing updated");
          setEditListing(null);
        },
        onError: (err) => toast.error(err.message ?? "Failed to update listing"),
      }
    );
  }

  function handleDelete(listingId: string) {
    deleteListing(listingId, {
      onSuccess: () => toast.success("Listing deleted"),
      onError: () => toast.error("Failed to delete listing"),
    });
  }

  if (isLoading) {
    return <Skeleton className="h-40 rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {listings.length} {listings.length === 1 ? "listing" : "listings"}
        </h3>
        <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Listing
        </Button>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No marketplace listings yet"
          description="Track where this product is listed across Etsy, Amazon, Shopify, and more."
          action={
            <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Listing
            </Button>
          }
        />
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Marketplace</TableHead>
                <TableHead>Listing ID</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Fee %</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Listed</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">{listing.marketplace}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">
                    {listing.listingId ?? "—"}
                  </TableCell>
                  <TableCell>
                    {listing.listingUrl ? (
                      <a
                        href={listing.listingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline text-sm"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">${listing.listedPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    {listing.platformFee != null ? `${listing.platformFee}%` : "—"}
                  </TableCell>
                  <TableCell>
                    <ListingStatusBadge status={listing.status} />
                  </TableCell>
                  <TableCell>
                    {listing.dateListed
                      ? new Date(listing.dateListed).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setEditListing(listing)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        }
                        title="Delete listing?"
                        description={`This will permanently delete the ${listing.marketplace} listing.`}
                        onConfirm={() => handleDelete(listing.id)}
                        isPending={isDeleting}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Listing</DialogTitle>
          </DialogHeader>
          <ListingForm onSubmit={handleCreate} isPending={isCreating} submitLabel="Add Listing" />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editListing} onOpenChange={(open) => !open && setEditListing(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editListing && (
            <ListingForm
              defaultValues={{
                marketplace: editListing.marketplace,
                listingId: editListing.listingId ?? "",
                listingUrl: editListing.listingUrl ?? "",
                listedPrice: editListing.listedPrice,
                platformFee: editListing.platformFee ?? undefined,
                status: editListing.status as ListingCreateInput["status"],
                dateListed: editListing.dateListed ?? "",
                notes: editListing.notes ?? "",
              }}
              onSubmit={handleUpdate}
              isPending={isUpdating}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

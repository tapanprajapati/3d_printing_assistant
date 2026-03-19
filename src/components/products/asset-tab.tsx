"use client";

import { ImageGallery } from "./image-gallery";
import { ModelFileList } from "./model-file-list";

export function AssetTab({ productId }: { productId: string }) {
  return (
    <div className="space-y-8 max-w-3xl">
      <section>
        <h2 className="text-lg font-semibold mb-3">Images</h2>
        <ImageGallery productId={productId} />
      </section>
      <section>
        <h2 className="text-lg font-semibold mb-3">3D Model Files</h2>
        <ModelFileList productId={productId} />
      </section>
    </div>
  );
}

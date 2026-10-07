import React, { useState, useEffect } from 'react';
import type { ProductImageResponse } from '../types';
import { getAssetUrl } from '../../../utils/assetUtils';

interface ProductImageGalleryProps {
  images: ProductImageResponse[];
  productName: string;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (images && images.length > 0) {
      const primaryIndex = images.findIndex((img) => img.isPrimary);
      setActiveIndex(primaryIndex >= 0 ? primaryIndex : 0);
    } else {
      setActiveIndex(0);
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-page text-text-muted">
        <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const activeImage = images[activeIndex];
  const activeUrl = activeImage ? getAssetUrl(activeImage.imageUrl) : '';
  const isCurrentFailed = activeImage ? failedImages[activeImage.imageId] : false;

  return (
    <div className="flex flex-col space-y-4">
      <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-page sm:aspect-square flex items-center justify-center">
        {activeUrl && !isCurrentFailed ? (
          <img
            src={activeUrl}
            alt={productName}
            onError={() => {
              if (activeImage) {
                setFailedImages(prev => ({ ...prev, [activeImage.imageId]: true }));
              }
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-text-muted opacity-50">
            <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs mt-2 font-bold">No Image</span>
          </div>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {images.map((img, index) => {
            const thumbUrl = getAssetUrl(img.imageUrl);
            const isThumbFailed = failedImages[img.imageId];
            return (
              <button
                key={img.imageId}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-label={`View image ${index + 1} of ${productName}`}
                className={`relative flex h-20 w-20 flex-shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-md bg-page transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  index === activeIndex ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-border-subtle opacity-70 hover:opacity-100'
                }`}
              >
                {!isThumbFailed && thumbUrl ? (
                  <img
                    src={thumbUrl}
                    alt=""
                    onError={() => setFailedImages(prev => ({ ...prev, [img.imageId]: true }))}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold">{index + 1}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

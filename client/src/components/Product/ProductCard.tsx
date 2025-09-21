import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { HeartIcon, StarIcon, EyeIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';

interface ProductCardProps {
  product: Product;
  onFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showArtisan?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onFavorite,
  isFavorite = false,
  showArtisan = true
}) => {
  const primaryImage = product.images.find(img => img.isPrimary) || product.images[0];
  const isInStock = product.availability === 'in_stock';
  const isMadeToOrder = product.availability === 'made_to_order';

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(product.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/product/${product.id}`}>
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleFavorite}
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              {isFavorite ? (
                <HeartSolidIcon className="w-4 h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-4 h-4 text-gray-600" />
              )}
            </button>
            <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200">
              <EyeIcon className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Availability Badge */}
          <div className="absolute top-3 left-3">
            {isInStock && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                In Stock
              </span>
            )}
            {isMadeToOrder && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                Made to Order
              </span>
            )}
            {product.availability === 'out_of_stock' && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                Out of Stock
              </span>
            )}
          </div>

          {/* AI Generated Badge */}
          {product.aiGenerated && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                AI Generated
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-200">
            {product.title}
          </h3>

          {/* Artisan Info */}
          {showArtisan && (
            <p className="text-sm text-gray-600 mb-2">
              by Artisan Name
            </p>
          )}

          {/* Category & Materials */}
          <div className="flex flex-wrap gap-1 mb-3">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {product.category}
            </span>
            {product.materials.slice(0, 2).map((material, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
              >
                {material}
              </span>
            ))}
            {product.materials.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                +{product.materials.length - 2} more
              </span>
            )}
          </div>

          {/* Cultural Significance */}
          {product.culturalSignificance && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {product.culturalSignificance}
            </p>
          )}

          {/* Price & Rating */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              <span className="text-sm text-gray-500">INR</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-600">4.5</span>
            </div>
          </div>

          {/* Made to Order Time */}
          {isMadeToOrder && product.madeToOrderTime && (
            <div className="mt-2 text-sm text-gray-500">
              Delivery in {product.madeToOrderTime} days
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;

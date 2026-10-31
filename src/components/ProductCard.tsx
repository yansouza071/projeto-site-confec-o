import React from 'react';
import { Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onQuickAdd: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect, onQuickAdd }) => {
  const isLowStock = product.totalStock > 0 && product.totalStock <= 15;
  const isOutOfStock = product.totalStock <= 0;

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Product Image & Quick Action Overlay */}
      <div
        onClick={() => onSelect(product)}
        className="relative aspect-[3/4] bg-stone-100 overflow-hidden cursor-pointer"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Stock & Category Quiet Labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
          <span className="text-[11px] font-semibold text-stone-900 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm">
            {product.category}
          </span>
          {isLowStock && (
            <span className="text-[10px] font-medium text-amber-900 bg-amber-100/95 backdrop-blur-sm px-2 py-0.5 rounded">
              Apenas {product.totalStock} restantes
            </span>
          )}
          {isOutOfStock && (
            <span className="text-[10px] font-medium text-rose-900 bg-rose-100/95 backdrop-blur-sm px-2 py-0.5 rounded">
              Esgotado
            </span>
          )}
        </div>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex-1 py-2 px-3 bg-white/95 hover:bg-white text-stone-900 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Ver Detalhes
          </button>
          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAdd(product);
              }}
              className="py-2 px-3 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              title="Adicionar ao Carrinho"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Subtle metadata */}
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
            <span>{product.composition.split('|')[0].trim()}</span>
          </div>

          <h3
            onClick={() => onSelect(product)}
            className="font-serif text-base font-semibold text-stone-900 hover:text-stone-700 cursor-pointer line-clamp-1 transition-colors"
          >
            {product.name}
          </h3>

          <p className="text-xs text-stone-500 line-clamp-2 mt-1">
            {product.description}
          </p>
        </div>

        {/* Available sizes */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-stone-400 font-medium">Tamanhos:</span>
          {product.sizes.map((s) => (
            <span
              key={s}
              className="text-[10px] font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Price & Stock info */}
        <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-stone-900">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through">
                  R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-stone-500 block">
              ou 10x de R$ {(product.price / 10).toFixed(2).replace('.', ',')} sem juros
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-emerald-700 font-medium block">
              {product.totalStock} em estoque
            </span>
            <span className="text-[10px] text-stone-400">Ateliê SP</span>
          </div>
        </div>
      </div>
    </div>
  );
};

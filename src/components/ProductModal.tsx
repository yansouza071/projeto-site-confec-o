import React, { useState } from 'react';
import { X, ShoppingBag, Check, ShieldCheck, Ruler, Sparkles } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string, quantity: number) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState<string>(product.colors[0]?.name || '');
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [quantity, setQuantity] = useState<number>(1);
  const [showMeasureGuide, setShowMeasureGuide] = useState<boolean>(false);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  // Determina estoque específico para a variação selecionada
  const currentVariant = product.variants.find(
    (v) =>
      v.size.toLowerCase() === selectedSize.toLowerCase() &&
      v.color.toLowerCase() === selectedColor.toLowerCase()
  );

  const availableStock = currentVariant ? currentVariant.stock : 0;

  const handleAdd = () => {
    if (availableStock <= 0) return;
    onAddToCart(product, selectedSize, selectedColor, quantity);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 border border-stone-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-stone-500 hover:text-stone-900 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery Column */}
          <div className="p-6 bg-stone-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200">
            <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-inner bg-stone-100">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />
              <span className="absolute top-3 left-3 text-[11px] font-semibold text-stone-900 bg-white/95 px-2.5 py-1 rounded shadow-sm">
                Confecção Própria VesteBem
              </span>
            </div>

            {/* Thumbnails */}
            {product.gallery && product.gallery.length > 1 && (
              <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1">
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      selectedImage === img ? 'border-stone-900 ring-2 ring-stone-900/20' : 'border-stone-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details & Customization Column */}
          <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="uppercase tracking-wider font-semibold text-stone-600">
                  {product.category} · Ateliê Nobre
                </span>
                <span className="text-amber-700 font-medium">★ {product.rating} ({product.reviewCount} avaliações)</span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-stone-900">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-stone-400 line-through">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                  5% OFF no PIX
                </span>
              </div>
              <span className="text-xs text-stone-500 block mt-0.5">
                ou até 10x de R$ {(product.price / 10).toFixed(2).replace('.', ',')} sem juros no cartão
              </span>

              {/* Description */}
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mt-4">
                {product.description}
              </p>

              {/* Composition & Care */}
              <div className="mt-4 p-3 bg-stone-50 rounded-xl text-xs space-y-1.5 border border-stone-200">
                <div className="flex items-center gap-1.5 font-medium text-stone-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Composição Têxtil:</span>
                  <span className="font-normal text-stone-600">{product.composition}</span>
                </div>
                <div className="text-stone-500 text-[11px]">
                  <span>Cuidados: {product.careInstructions}</span>
                </div>
              </div>

              {/* Color Selector */}
              <div className="mt-5">
                <label className="block text-xs font-semibold text-stone-900 mb-2">
                  Cor da Peça: <span className="font-normal text-stone-600">{selectedColor}</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        selectedColor === c.name
                          ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-black/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector with Measure Guide Button */}
              <div className="mt-5">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-stone-900">
                    Grade de Tamanhos: <span className="font-normal text-stone-600">{selectedSize}</span>
                  </label>
                  <button
                    onClick={() => setShowMeasureGuide(!showMeasureGuide)}
                    className="text-xs text-stone-700 hover:text-stone-950 underline flex items-center gap-1 font-medium"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    Tabela de Medidas
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizes.map((s) => {
                    const varMatch = product.variants.find(
                      (v) =>
                        v.size.toLowerCase() === s.toLowerCase() &&
                        v.color.toLowerCase() === selectedColor.toLowerCase()
                    );
                    const varStock = varMatch ? varMatch.stock : 0;
                    const isSelectable = varStock > 0;

                    return (
                      <button
                        key={s}
                        disabled={!isSelectable}
                        onClick={() => setSelectedSize(s)}
                        className={`min-w-[42px] h-9 px-3 rounded-lg text-xs font-semibold border flex flex-col items-center justify-center transition-all ${
                          selectedSize === s
                            ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                            : isSelectable
                            ? 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                            : 'border-stone-100 bg-stone-100 text-stone-300 line-through cursor-not-allowed'
                        }`}
                      >
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Stock Indicator */}
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {availableStock > 0 ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {availableStock} unidades em estoque no tamanho {selectedSize} ({selectedColor})
                    </span>
                  ) : (
                    <span className="text-rose-700 font-medium">
                      Esgotado nesta variação. Escolha outro tamanho ou cor.
                    </span>
                  )}
                </div>

                {/* Measure Guide Accordion */}
                {showMeasureGuide && (
                  <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs space-y-2">
                    <span className="font-semibold text-stone-900 block">
                      Guia de Alfaiataria (Medidas em Centímetros):
                    </span>
                    <table className="w-full text-[11px] text-stone-600 border-collapse">
                      <thead>
                        <tr className="border-b border-stone-200 text-stone-900">
                          <th className="py-1 text-left">Tam</th>
                          <th className="py-1 text-left">Busto</th>
                          <th className="py-1 text-left">Cintura</th>
                          <th className="py-1 text-left">Quadril</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-stone-100">
                          <td className="py-1 font-semibold">PP / 36</td>
                          <td>82-86</td>
                          <td>64-68</td>
                          <td>90-94</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="py-1 font-semibold">P / 38</td>
                          <td>86-90</td>
                          <td>68-72</td>
                          <td>94-98</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="py-1 font-semibold">M / 40</td>
                          <td>90-96</td>
                          <td>72-78</td>
                          <td>98-104</td>
                        </tr>
                        <tr className="border-b border-stone-100">
                          <td className="py-1 font-semibold">G / 42</td>
                          <td>96-102</td>
                          <td>78-84</td>
                          <td>104-110</td>
                        </tr>
                        <tr>
                          <td className="py-1 font-semibold">GG / 44</td>
                          <td>102-108</td>
                          <td>84-90</td>
                          <td>110-116</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart Section */}
            <div className="pt-4 border-t border-stone-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden bg-white">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-xs font-semibold text-stone-900 min-w-[32px] text-center">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity >= availableStock}
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    className="px-3 py-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={availableStock <= 0}
                  onClick={handleAdd}
                  className={`flex-1 py-3 px-6 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                    addedSuccess
                      ? 'bg-emerald-600 text-white'
                      : availableStock > 0
                      ? 'bg-stone-900 hover:bg-stone-800 text-white'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Adicionado ao Carrinho!
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {availableStock > 0 ? 'Adicionar ao Carrinho' : 'Sem Estoque'}
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-stone-700" />
                  1ª Troca Grátis com logística reversa
                </span>
                <span>Envio em até 24h úteis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

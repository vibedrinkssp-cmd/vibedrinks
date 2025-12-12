import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/lib/cart';
import { useToast } from '@/hooks/use-toast';
import { Wine, Loader2, Plus, Minus, ShoppingCart, Sparkles } from 'lucide-react';
import type { Product, Category } from '@shared/schema';
import { motion, AnimatePresence } from 'framer-motion';

interface SpecialDrinksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpecialDrinksModal({ open, onOpenChange }: SpecialDrinksModalProps) {
  const { items, addItem, updateQuantity } = useCart();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const specialDrinkKeywords = ['caipirinha', 'drink', 'licor', 'caipiroska', 'moscow mule', 'mojito', 'margarita', 'cosmopolitan', 'ice', 'caipi', 'caipo', 'sex on the beach', 'pina colada', 'blue lagoon', 'gin tonica', 'gin tonico', 'whisky cola', 'cuba libre', 'negroni', 'aperol', 'sangria', 'spritz', 'batida', '43'];
  const specialCategoryNames = ['caipirinhas', 'drinks especiais', 'copos / drinks', 'drinks', 'licores', 'caipivodkas', 'caipiroskas'];

  const specialCategories = categories.filter(c => 
    c.isActive && 
    specialCategoryNames.some(name => c.name.toLowerCase().includes(name))
  );

  const specialDrinks = products.filter(p => {
    if (!p.isActive) return false;
    if (p.stock <= 0) return false;
    
    const inSpecialCategory = specialCategories.some(c => c.id === p.categoryId);
    const hasSpecialKeyword = specialDrinkKeywords.some(keyword => 
      p.name.toLowerCase().includes(keyword)
    );
    const isComboEligible = p.comboEligible;
    
    const matchesSelectedCategory = !selectedCategory || p.categoryId === selectedCategory;
    
    return (inSpecialCategory || hasSpecialKeyword || isComboEligible) && matchesSelectedCategory;
  });

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(price));
  };

  const getCartQuantity = (productId: string) => {
    const item = items.find(i => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const handleAddToCart = (product: Product) => {
    const cartItem = items.find(i => i.productId === product.id);
    const currentQty = cartItem?.quantity ?? 0;
    
    if (product.stock <= 0 || currentQty >= product.stock) {
      toast({
        title: 'Estoque Insuficiente',
        description: `O produto ${product.name} esta com estoque zerado ou voce ja adicionou a quantidade maxima disponivel.`,
        variant: 'destructive',
      });
      return;
    }
    
    addItem(product);
    toast({
      title: 'Adicionado ao carrinho',
      description: `${product.name} foi adicionado.`,
    });
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
              <Wine className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Drinks Especiais da Casa
            </span>
            <Sparkles className="h-5 w-5 text-pink-400" />
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className={selectedCategory === null ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                data-testid="button-filter-all"
              >
                Todos
              </Button>
              {specialCategories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className={selectedCategory === category.id ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}
                  data-testid={`button-filter-${category.id}`}
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {specialDrinks.length === 0 ? (
              <div className="text-center py-12">
                <Wine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhum drink especial disponivel no momento.</p>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AnimatePresence mode="popLayout">
                  {specialDrinks.map((product) => {
                    const quantity = getCartQuantity(product.id);
                    const isOutOfStock = product.stock <= 0;

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        layout
                      >
                        <Card 
                          className="overflow-hidden border border-purple-500/20 hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
                          data-testid={`card-special-drink-${product.id}`}
                        >
                          <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Wine className="h-16 w-16 text-purple-400/50" />
                              </div>
                            )}
                            
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <Badge variant="secondary">Esgotado</Badge>
                              </div>
                            )}

                            <Badge 
                              className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 border-none"
                            >
                              Especial
                            </Badge>
                          </div>
                          
                          <div className="p-4 space-y-3">
                            <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                            
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-lg text-purple-400">
                                {formatPrice(product.salePrice)}
                              </span>
                              
                              {!isOutOfStock && (
                                <>
                                  {quantity === 0 ? (
                                    <Button
                                      size="sm"
                                      onClick={() => handleAddToCart(product)}
                                      className="bg-gradient-to-r from-purple-500 to-pink-500"
                                      data-testid={`button-add-${product.id}`}
                                    >
                                      <Plus className="h-4 w-4 mr-1" />
                                      Adicionar
                                    </Button>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => updateQuantity(product.id, quantity - 1)}
                                        data-testid={`button-decrease-${product.id}`}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center font-bold">{quantity}</span>
                                      <Button
                                        size="icon"
                                        onClick={() => updateQuantity(product.id, quantity + 1)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500"
                                        data-testid={`button-increase-${product.id}`}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}

            <div className="border-t pt-4">
              <Button 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500" 
                size="lg"
                onClick={() => onOpenChange(false)}
                data-testid="button-close-special-drinks"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Continuar Comprando
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

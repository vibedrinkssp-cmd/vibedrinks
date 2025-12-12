import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Phone, Clock, MapPin, Instagram, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/home/HeroSection';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { CategoryCarousel } from '@/components/home/CategoryCarousel';
import { ProductGrid } from '@/components/home/ProductGrid';
import { CartSheet } from '@/components/cart/CartSheet';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { Button } from '@/components/ui/button';
import logoImage from '@assets/vibedrinksfinal_1765554834904.gif';
import type { Product, Category, Banner } from '@shared/schema';

export const TRENDING_CATEGORY_ID = '__trending__';

export default function Home() {
  const [, setLocation] = useLocation();
  const { role } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const privilegedRoles = ['admin', 'kitchen', 'pdv', 'motoboy'];
    if (role && privilegedRoles.includes(role)) {
      const redirectMap: Record<string, string> = {
        admin: '/admin',
        kitchen: '/cozinha',
        pdv: '/pdv',
        motoboy: '/motoboy',
      };
      setLocation(redirectMap[role]);
    }
  }, []);

  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const { data: categories = [] } = useQuery<(Category & { salesCount: number })[]>({
    queryKey: ['/api/categories/by-sales'],
  });

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['/api/banners'],
  });

  const { data: trendingProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/trending'],
  });

  const hasTrendingProducts = trendingProducts.length > 0;

  const displayProducts = selectedCategory === TRENDING_CATEGORY_ID 
    ? trendingProducts 
    : products;

  const effectiveCategory = selectedCategory === TRENDING_CATEGORY_ID 
    ? null 
    : selectedCategory;

  return (
    <div className="min-h-screen bg-background">
      <Header onCartOpen={() => setCartOpen(true)} />
      
      <main>
        <HeroSection />
        
        <BannerCarousel banners={banners} />
        
        <CategoryCarousel 
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          showTrending={hasTrendingProducts}
        />
        
        <ProductGrid 
          products={displayProducts}
          isLoading={productsLoading}
          selectedCategory={effectiveCategory}
        />

        <section className="py-16 px-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-primary mb-4">
                Por que escolher a Vibe Drinks?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Oferecemos a melhor selecao de bebidas premium com entrega rapida e atendimento de qualidade
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Clock,
                  title: 'Entrega Rapida',
                  description: 'Receba suas bebidas em ate 40 minutos na regiao metropolitana'
                },
                {
                  icon: MapPin,
                  title: 'Ampla Cobertura',
                  description: 'Atendemos toda a Grande Sao Paulo com taxas acessiveis'
                },
                {
                  icon: MessageCircle,
                  title: 'Atendimento 24h',
                  description: 'Suporte via WhatsApp para tirar todas suas duvidas'
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="text-center p-8 rounded-2xl bg-card/50 border border-primary/10 backdrop-blur-sm"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-amber-500/10 flex items-center justify-center">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-primary/20">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <img src={logoImage} alt="Vibe Drinks" className="h-12 mb-4" />
              <p className="text-muted-foreground text-sm max-w-md mb-6">
                A melhor adega e drinkeria de Sao Paulo. Bebidas premium com entrega rapida para sua casa ou evento.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                >
                  <Instagram className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary/10"
                >
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Links Rapidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#products-section" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Cardapio
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Minha Conta
                  </a>
                </li>
                <li>
                  <a href="/pedidos" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    Meus Pedidos
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Contato</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  (11) 99999-9999
                </li>
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  Seg-Dom: 18h - 23h
                </li>
                <li className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  Grande Sao Paulo
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-primary/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-muted-foreground text-xs">
              2024 Vibe Drinks. Todos os direitos reservados.
            </p>
            <p className="text-muted-foreground text-xs">
              Proibida a venda para menores de 18 anos
            </p>
          </div>
        </div>
      </footer>

      <FloatingCartButton onClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}

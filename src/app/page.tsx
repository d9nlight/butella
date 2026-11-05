import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Phone, Clock, ShieldCheck, Heart } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { getProducts } from "@/lib/supabase/products";
import { ProductCard } from "@/components/product/ProductCard";

export default async function HomePage() {
  const products = await getProducts();
  const newArrivals = products.filter((p) => p.isNewArrival);
  const featured = products.filter((p) => p.isFeatured);

  const categories = [
    {
      name: "Платья",
      count: "12 моделей",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      href: "/catalog?cat=Платья",
    },
    {
      name: "Костюмы",
      count: "8 моделей",
      image: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80",
      href: "/catalog?cat=Костюмы",
    },
    {
      name: "Верхняя одежда",
      count: "6 моделей",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
      href: "/catalog?cat=Верхняя+одежда",
    },
    {
      name: "Блузы и топы",
      count: "9 моделей",
      image: "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=800&q=80",
      href: "/catalog?cat=Блузы+и+топы",
    },
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-[#141414] text-[#FAF8F5] overflow-hidden">
        {/* Background Editorial Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=85"
            alt="BUTELLA Boutique Fashion"
            fill
            priority
            className="object-cover object-center opacity-40 scale-105 animate-subtle-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center py-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-xs text-xs tracking-[0.25em] uppercase text-[#FAF8F5] mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>Новая осенне-зимняя коллекция 2026</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal tracking-tight text-white leading-[1.1] mb-6">
            Искусство быть <br className="hidden sm:inline" />
            <span className="italic font-light text-[#E6DCD1]">безупречной</span> каждый день
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-neutral-300 font-light leading-relaxed mb-10 tracking-wide">
            Эксклюзивный бутик женской одежды в Кызылорде. Изысканные силуэты, премиальные ткани и внимание к каждой детали вашего образа.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/catalog"
              className="w-full sm:w-auto bg-[#FAF8F5] text-[#141414] px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium hover:bg-[#C5A059] hover:text-black transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
              <span>Смотреть коллекцию</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/#boutique"
              className="w-full sm:w-auto px-8 py-4 text-xs uppercase tracking-[0.2em] font-medium text-white border border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 backdrop-blur-xs text-center"
            >
              Бутик в Кызылорде
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-2">
            Гардероб BUTELLA
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#141414] tracking-tight">
            Категории одежды
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-4/5 overflow-hidden rounded-xs bg-neutral-200 block"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity group-hover:opacity-90" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-light mb-1">
                  {cat.count}
                </p>
                <h3 className="font-serif text-lg sm:text-xl font-medium tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b border-[#E6DCD1]">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-1">
              Свежие поступления
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#141414]">
              Новинки недели
            </h2>
          </div>
          <Link
            href="/catalog"
            className="mt-3 sm:mt-0 text-xs uppercase tracking-widest text-[#141414] hover:text-[#C5A059] flex items-center gap-1.5 transition-colors font-medium"
          >
            <span>Весь каталог ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. EDITORIAL BANNER (Boutique Story) */}
      <section className="bg-[#FAF8F5] border-y border-[#E6DCD1] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Image Pair */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative aspect-3/4 rounded-xs overflow-hidden shadow-sm">
                <Image
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
                  alt="BUTELLA Lookbook 1"
                  fill
                  sizes="40vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="relative aspect-3/4 rounded-xs overflow-hidden shadow-sm mt-8">
                <Image
                  src="https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=800&q=80"
                  alt="BUTELLA Lookbook 2"
                  fill
                  sizes="40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Story text */}
            <div className="space-y-6 lg:pl-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block">
                Философия бутика
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#141414] leading-tight">
                Создаем образы, которые подчеркивают вашу индивидуальность
              </h2>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                Бутик <strong>BUTELLA</strong> в Кызылорде родился из любви к женственности, чистоте линий и безупречному качеству. Мы отбираем каждую модель вручную: от посадки жакетов до нежнейшего шелка вечерних платьев.
              </p>
              <p className="text-sm text-neutral-600 leading-relaxed font-light">
                В нашем бутике вы всегда можете примерить понравившийся наряд, получить совет стилиста или заказать доставку прямо до двери с оплатой через <strong>Kaspi</strong>.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/catalog?cat=Костюмы"
                  className="inline-flex items-center justify-center gap-2 bg-[#141414] text-white px-6 py-3.5 text-xs uppercase tracking-widest hover:bg-[#C5A059] hover:text-black transition-all duration-300"
                >
                  <span>Коллекция костюмов</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <a
                  href="https://wa.me/77779418188"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-neutral-300 px-6 py-3.5 text-xs uppercase tracking-widest text-neutral-800 hover:border-black transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Консультация стилиста</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS (Хиты) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#A0826C] font-semibold block mb-1">
            Выбор наших покупательниц
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl text-[#141414]">
            Хиты бутика BUTELLA
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {featured.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 6. STORE VISIT & LOCATION SECTION (KYZYLORDA) */}
      <section id="boutique" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="bg-[#141414] text-[#FAF8F5] rounded-xs p-8 sm:p-12 lg:p-16 relative overflow-hidden">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-medium mb-3">
                Ждем вас в гости
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white mb-6">
                Наш бутик в Кызылорде
              </h2>
              <p className="text-sm text-neutral-300 font-light leading-relaxed mb-8">
                Приглашаем вас на чашечку кофе и персональную примерку. В уютной атмосфере бутика наши стилисты помогут составить гардероб для любого повода.
              </p>

              <div className="space-y-4 text-sm text-neutral-300 font-light">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Адрес бутика:</strong>
                    <span>г. Кызылорда, ADS Plaza 116 бутик (Бутик BUTELLA)</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Режим работы:</strong>
                    <span>Ежедневно с 10:00 до 20:00 без выходных</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#C5A059] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block font-medium">Телефон / WhatsApp:</strong>
                    <a href="tel:+77779418188" className="hover:text-[#C5A059] transition-colors">
                      +7 (777) 941-81-88
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="https://wa.me/77779418188"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#C5A059] text-black px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-white transition-colors"
                >
                  Написать в WhatsApp
                </a>
                <a
                  href="https://instagram.com/butella_fashion_kzo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-white/30 text-white px-6 py-3 text-xs uppercase tracking-widest hover:border-white transition-colors"
                >
                  Instagram @butella_fashion_kzo
                </a>
              </div>
            </div>

            {/* Visual Store Card */}
            <div className="relative aspect-4/3 lg:aspect-square rounded-xs overflow-hidden border border-white/10">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80"
                alt="Бутик BUTELLA Кызылорда интерьер"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>
        </div>
      </section>

      {/* 7. INSTAGRAM FEED TEASER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <InstagramIcon className="w-6 h-6 text-[#141414] mx-auto mb-2" />
          <h2 className="font-serif text-2xl text-[#141414]">
            Мы в Instagram
          </h2>
          <a
            href="https://instagram.com/butella_fashion_kzo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-widest text-[#A0826C] hover:text-black transition-colors font-medium mt-1 inline-block"
          >
            @butella_fashion_kzo — Подписывайтесь на ежедневные обзоры
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=500&q=80",
            "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=500&q=80",
          ].map((src, idx) => (
            <a
              key={idx}
              href="https://instagram.com/butella_fashion_kzo"
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-square block overflow-hidden group rounded-xs bg-neutral-100"
            >
              <Image
                src={src}
                alt={`Instagram look ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 16vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <InstagramIcon className="w-5 h-5" />
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}

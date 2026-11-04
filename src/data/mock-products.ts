import { Product } from "@/types/ecommerce";

export const CATEGORIES = [
  "Все",
  "Платья",
  "Костюмы",
  "Верхняя одежда",
  "Блузы и топы",
  "Юбки и брюки",
] as const;

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    title: "Шелковое платье-миди «Aura»",
    slug: "shelkovoe-platye-midi-aura",
    description:
      "Утонченное платье миди из струящегося премиального искусственного шелка. Приталенный силуэт, деликатный вырез и струящийся подол подчеркивают женственность. Идеально для вечерних выходов, торжеств и свиданий в Кызылорде.",
    category: "Платья",
    basePrice: 28500,
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    images: [
      {
        id: "img-1-1",
        productId: "prod-1",
        imageUrl:
          "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
      {
        id: "img-1-2",
        productId: "prod-1",
        imageUrl:
          "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 2,
        isPrimary: false,
      },
    ],
    variants: [
      { id: "var-1-xs", productId: "prod-1", size: "XS", color: "Шампань", colorHex: "#F2E8DC", stockQuantity: 3 },
      { id: "var-1-s", productId: "prod-1", size: "S", color: "Шампань", colorHex: "#F2E8DC", stockQuantity: 5 },
      { id: "var-1-m", productId: "prod-1", size: "M", color: "Шампань", colorHex: "#F2E8DC", stockQuantity: 2 },
      { id: "var-1-l", productId: "prod-1", size: "L", color: "Шампань", colorHex: "#F2E8DC", stockQuantity: 0 },
    ],
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-01T10:00:00Z",
  },
  {
    id: "prod-2",
    title: "Брючный костюм «Milano» оверсайз",
    slug: "bryuchny-kostyum-milano-oversize",
    description:
      "Двубортный жакет прямого кроя и широкие брюки со стрелками палаццо. Сшит из плотной костюмной ткани с добавлением вискозы. Безупречная посадка для деловых встреч и стильных повседневных образов.",
    category: "Костюмы",
    basePrice: 42000,
    isActive: true,
    isFeatured: true,
    isNewArrival: true,
    images: [
      {
        id: "img-2-1",
        productId: "prod-2",
        imageUrl:
          "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
      {
        id: "img-2-2",
        productId: "prod-2",
        imageUrl:
          "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 2,
        isPrimary: false,
      },
    ],
    variants: [
      { id: "var-2-s", productId: "prod-2", size: "S", color: "Графит", colorHex: "#3D3D3D", stockQuantity: 4 },
      { id: "var-2-m", productId: "prod-2", size: "M", color: "Графит", colorHex: "#3D3D3D", stockQuantity: 3 },
      { id: "var-2-l", productId: "prod-2", size: "L", color: "Графит", colorHex: "#3D3D3D", stockQuantity: 2 },
    ],
    createdAt: "2026-11-02T11:00:00Z",
    updatedAt: "2026-11-02T11:00:00Z",
  },
  {
    id: "prod-3",
    title: "Шерстяное пальто-халат «Cashmere Touch»",
    slug: "sherstanoe-palto-khalat-cashmere-touch",
    description:
      "Уютное демисезонное пальто благородного песочного оттенка с поясом на талии. Рукава реглан, глубокие накладные карманы и мягкая текстура ткани согревают в прохладную погоду.",
    category: "Верхняя одежда",
    basePrice: 56000,
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    images: [
      {
        id: "img-3-1",
        productId: "prod-3",
        imageUrl:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
      {
        id: "img-3-2",
        productId: "prod-3",
        imageUrl:
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 2,
        isPrimary: false,
      },
    ],
    variants: [
      { id: "var-3-s", productId: "prod-3", size: "S", color: "Песочный", colorHex: "#D5C3B2", stockQuantity: 2 },
      { id: "var-3-m", productId: "prod-3", size: "M", color: "Песочный", colorHex: "#D5C3B2", stockQuantity: 2 },
    ],
    createdAt: "2026-10-25T09:00:00Z",
    updatedAt: "2026-10-25T09:00:00Z",
  },
  {
    id: "prod-4",
    title: "Атласная блуза с воротником-стойкой",
    slug: "atlasnaya-bluza-s-vorotnikom-stoykoy",
    description:
      "Изысканная блуза с легким жемчужным блеском и объемными рукавами на манжетах. Свободный крой прекрасно сочетается как с классическими брюками, так и с джинсами.",
    category: "Блузы и топы",
    basePrice: 19500,
    isActive: true,
    isFeatured: false,
    isNewArrival: true,
    images: [
      {
        id: "img-4-1",
        productId: "prod-4",
        imageUrl:
          "https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      { id: "var-4-xs", productId: "prod-4", size: "XS", color: "Молочный", colorHex: "#FAF8F5", stockQuantity: 5 },
      { id: "var-4-s", productId: "prod-4", size: "S", color: "Молочный", colorHex: "#FAF8F5", stockQuantity: 4 },
      { id: "var-4-m", productId: "prod-4", size: "M", color: "Молочный", colorHex: "#FAF8F5", stockQuantity: 3 },
    ],
    createdAt: "2026-10-28T14:30:00Z",
    updatedAt: "2026-10-28T14:30:00Z",
  },
  {
    id: "prod-5",
    title: "Вечернее платье-комбинация в пол",
    slug: "vechernee-platye-kombinatsiya-v-pol",
    description:
      "Культовая модель в минималистичном стиле 90-х. Тонкие бретели, открытая спинка и струящийся черный шелк создают безупречный вечерний образ.",
    category: "Платья",
    basePrice: 34000,
    isActive: true,
    isFeatured: true,
    isNewArrival: false,
    images: [
      {
        id: "img-5-1",
        productId: "prod-5",
        imageUrl:
          "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      { id: "var-5-s", productId: "prod-5", size: "S", color: "Глубокий черный", colorHex: "#141414", stockQuantity: 3 },
      { id: "var-5-m", productId: "prod-5", size: "M", color: "Глубокий черный", colorHex: "#141414", stockQuantity: 1 },
    ],
    createdAt: "2026-10-15T12:00:00Z",
    updatedAt: "2026-10-15T12:00:00Z",
  },
  {
    id: "prod-6",
    title: "Юбка-плиссе макси шоколадного оттенка",
    slug: "yubka-plisse-maksi-shokoladnaya",
    description:
      "Воздушная плиссированная юбка на мягком поясе. Универсальная длина макси и глубокий шоколадный цвет создают элегантный силуэт при движении.",
    category: "Юбки и брюки",
    basePrice: 22000,
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    images: [
      {
        id: "img-6-1",
        productId: "prod-6",
        imageUrl:
          "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80",
        displayOrder: 1,
        isPrimary: true,
      },
    ],
    variants: [
      { id: "var-6-s", productId: "prod-6", size: "S", color: "Шоколад", colorHex: "#423227", stockQuantity: 4 },
      { id: "var-6-m", productId: "prod-6", size: "M", color: "Шоколад", colorHex: "#423227", stockQuantity: 2 },
      { id: "var-6-l", productId: "prod-6", size: "L", color: "Шоколад", colorHex: "#423227", stockQuantity: 1 },
    ],
    createdAt: "2026-10-20T16:00:00Z",
    updatedAt: "2026-10-20T16:00:00Z",
  },
];

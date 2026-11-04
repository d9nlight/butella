-- ==============================================================================
-- BUTELLA BOUTIQUE — Initial Catalog Seed Data
-- ==============================================================================

DO $$
DECLARE
    p1 UUID := gen_random_uuid();
    p2 UUID := gen_random_uuid();
    p3 UUID := gen_random_uuid();
    p4 UUID := gen_random_uuid();
    p5 UUID := gen_random_uuid();
    p6 UUID := gen_random_uuid();
BEGIN
    -- 1. Product 1: Шелковое платье-миди «Aura»
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p1,
        'Шелковое платье-миди «Aura»',
        'shelkovoe-platye-midi-aura',
        'Утонченное платье миди из струящегося премиального искусственного шелка. Приталенный силуэт, деликатный вырез и струящийся подол подчеркивают женственность. Идеально для вечерних выходов, торжеств и свиданий в Кызылорде.',
        'Платья',
        28500,
        true,
        true,
        true
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p1, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80', 1, true),
    (p1, 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=80', 2, false);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p1, 'XS', 'Шампань', 3),
    (p1, 'S', 'Шампань', 5),
    (p1, 'M', 'Шампань', 2),
    (p1, 'L', 'Шампань', 0);

    -- 2. Product 2: Брючный костюм «Milano» оверсайз
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p2,
        'Брючный костюм «Milano» оверсайз',
        'bryuchny-kostyum-milano-oversize',
        'Двубортный жакет прямого кроя и широкие брюки со стрелками палаццо. Сшит из плотной костюмной ткани с добавлением вискозы. Безупречная посадка для деловых встреч и стильных повседневных образов.',
        'Костюмы',
        42000,
        true,
        true,
        true
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p2, 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80', 1, true),
    (p2, 'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?auto=format&fit=crop&w=1000&q=80', 2, false);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p2, 'S', 'Графит', 4),
    (p2, 'M', 'Графит', 3),
    (p2, 'L', 'Графит', 2);

    -- 3. Product 3: Шерстяное пальто-халат «Cashmere Touch»
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p3,
        'Шерстяное пальто-халат «Cashmere Touch»',
        'sherstanoe-palto-khalat-cashmere-touch',
        'Уютное демисезонное пальто благородного песочного оттенка с поясом на талии. Рукава реглан, глубокие накладные карманы и мягкая текстура ткани согревают в прохладную погоду.',
        'Верхняя одежда',
        56000,
        true,
        true,
        false
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p3, 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=1000&q=80', 1, true),
    (p3, 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80', 2, false);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p3, 'S', 'Песочный', 2),
    (p3, 'M', 'Песочный', 2);

    -- 4. Product 4: Атласная блуза с воротником-стойкой
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p4,
        'Атласная блуза с воротником-стойкой',
        'atlasnaya-bluza-s-vorotnikom-stoykoy',
        'Изысканная блуза с легким жемчужным блеском и объемными рукавами на манжетах. Свободный крой прекрасно сочетается как с классическими брюками, так и с джинсами.',
        'Блузы и топы',
        19500,
        true,
        false,
        true
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p4, 'https://images.unsplash.com/photo-1551803091-e20673f15770?auto=format&fit=crop&w=1000&q=80', 1, true);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p4, 'XS', 'Молочный', 5),
    (p4, 'S', 'Молочный', 4),
    (p4, 'M', 'Молочный', 3);

    -- 5. Product 5: Вечернее платье-комбинация в пол
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p5,
        'Вечернее платье-комбинация в пол',
        'vechernee-platye-kombinatsiya-v-pol',
        'Культовая модель в минималистичном стиле 90-х. Тонкие бретели, открытая спинка и струящийся черный шелк создают безупречный вечерний образ.',
        'Платья',
        34000,
        true,
        true,
        false
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p5, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=1000&q=80', 1, true);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p5, 'S', 'Глубокий черный', 3),
    (p5, 'M', 'Глубокий черный', 1);

    -- 6. Product 6: Юбка-плиссе макси шоколадного оттенка
    INSERT INTO public.products (id, title, slug, description, category, base_price, is_active, is_featured, is_new_arrival)
    VALUES (
        p6,
        'Юбка-плиссе макси шоколадного оттенка',
        'yubka-plisse-maksi-shokoladnaya',
        'Воздушная плиссированная юбка на мягком поясе. Универсальная длина макси и глубокий шоколадный цвет создают элегантный силуэт при движении.',
        'Юбки и брюки',
        22000,
        true,
        false,
        false
    ) ON CONFLICT (slug) DO NOTHING;

    INSERT INTO public.product_images (product_id, image_url, display_order, is_primary) VALUES
    (p6, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=1000&q=80', 1, true);

    INSERT INTO public.product_variants (product_id, size, color, stock_quantity) VALUES
    (p6, 'S', 'Шоколад', 4),
    (p6, 'M', 'Шоколад', 2),
    (p6, 'L', 'Шоколад', 1);

END $$;

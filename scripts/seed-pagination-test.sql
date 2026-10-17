DO $$
DECLARE
  i INT;
  r_id UUID;
  r_name TEXT;
  r_type INT;
  cover_url TEXT;
  gallery_url TEXT;
  cuisines TEXT[] := ARRAY['Multi-Cuisine', 'Biryani', 'South Indian', 'North Indian', 'Chinese', 'Mandi', 'Pure Veg'];
  cities TEXT[] := ARRAY['Kochi', 'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad'];
BEGIN
  FOR i IN 1..14 LOOP
    r_id := gen_random_uuid();
    r_type := (i % 3);

    IF r_type = 0 THEN
      r_name := '[ORIGINAL COVER] SpotQ Bistro #' || i;
      cover_url := 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80';
      gallery_url := NULL;
    ELSIF r_type = 1 THEN
      r_name := '[GALLERY FALLBACK] SpotQ Grill #' || i;
      cover_url := NULL;
      gallery_url := 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80';
    ELSE
      r_name := '[UI GRADIENT FALLBACK] SpotQ Cafe #' || i;
      cover_url := NULL;
      gallery_url := NULL;
    END IF;

    -- 1. Insert Restaurant
    INSERT INTO restaurants (
      id, restaurant_name, email, phone, owner_name, owner_email,
      status, onboarding_status, is_subscription_active, email_verified_at, created_at, updated_at
    ) VALUES (
      r_id, r_name, 'rest' || i || '@spotq-test.com', '+9198765000' || LPAD(i::text, 2, '0'),
      'Owner ' || i, 'owner' || i || '@spotq-test.com',
      'ACTIVE', 'COMPLETED', true, NOW(), NOW() - (i || ' hours')::INTERVAL, NOW()
    );

    -- 2. Insert Address
    INSERT INTO restaurant_addresses (
      id, restaurant_id, address_line1, city, state, country, pincode, latitude, longitude, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), r_id, 'Street #' || i, cities[(i % 6) + 1], 'State', 'India', '56000' || (i % 9),
      12.9716 + (i * 0.01), 77.5946 + (i * 0.01), NOW(), NOW()
    );

    -- 3. Insert Profile
    INSERT INTO restaurant_profile (
      id, restaurant_id, cuisine_type, average_cost, cover_image_key, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), r_id, cuisines[(i % 7) + 1], 400 + (i * 50), cover_url, NOW(), NOW()
    );

    -- 4. Insert Gallery Image if gallery fallback
    IF gallery_url IS NOT NULL THEN
      INSERT INTO restaurant_images (
        id, restaurant_id, object_key, display_order, created_at
      ) VALUES (
        gen_random_uuid(), r_id, gallery_url, 0, NOW()
      );
    END IF;

  END LOOP;
END $$;

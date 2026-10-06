-- ==============================================================================
-- E-COMMERCE SAMPLE DATA RESTORATION SCRIPT
-- Tables: brands, product_images, product_variant_image
-- Database: ecom
-- ==============================================================================

USE ecom;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- ၁။ BRANDS TABLE SAMPLE DATA (၁၀ ခု)
-- ------------------------------------------------------------------------------
TRUNCATE TABLE ecom.brands;

INSERT INTO ecom.brands 
(brand_id, brand_name, brand_logo_url, description, status, created_at, modified_at, modified_by) 
VALUES
(1, 'ASUS', 'https://upload.wikimedia.org/wikipedia/commons/2/2e/ASUS_Logo.svg', 'Leading technology company specializing in laptops, motherboards, and smartphones.', 'ACTIVE', NOW(), NOW(), 1),
(2, 'Apple', 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 'Premium technology company designing iPhones, iPads, MacBooks, and wearables.', 'ACTIVE', NOW(), NOW(), 1),
(3, 'NVIDIA', 'https://upload.wikimedia.org/wikipedia/commons/2/21/Nvidia_logo.svg', 'World leader in graphics processing units (GPUs) and AI computing technology.', 'ACTIVE', NOW(), NOW(), 1),
(4, 'Sony', 'https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg', 'Global entertainment and electronics brand famous for PlayStation, audio, and cameras.', 'ACTIVE', NOW(), NOW(), 1),
(5, 'Nike', 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg', 'World-renowned athletic footwear, apparel, and sports equipment brand.', 'ACTIVE', NOW(), NOW(), 1),
(6, 'The Ordinary', '/brands/the-ordinary.svg', 'Clinical formulations with integrity, offering targeted science-backed skincare solutions.', 'ACTIVE', NOW(), NOW(), 1),
(7, 'Samsung', 'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg', 'Global electronics titan known for Galaxy phones, premium displays, SSDs, and TVs.', 'ACTIVE', NOW(), NOW(), 1),
(8, 'Logitech', 'https://upload.wikimedia.org/wikipedia/commons/0/09/Logitech_logo.svg', 'Market leader in computer peripherals, premium mice, keyboards, and webcams.', 'ACTIVE', NOW(), NOW(), 1),
(9, 'Dyson', 'https://upload.wikimedia.org/wikipedia/commons/5/53/Dyson_logo.svg', 'Pioneering home appliances including vacuums, air purifiers, and hair styling tools.', 'ACTIVE', NOW(), NOW(), 1),
(10, 'Adidas', 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg', 'Global sportswear brand delivering iconic sneakers, streetwear, and athletic gear.', 'ACTIVE', NOW(), NOW(), 1);


-- ------------------------------------------------------------------------------
-- ၂။ PRODUCT_IMAGES TABLE SAMPLE DATA (Product 1 မှ 30 အထိ အပြည့်အစုံ)
-- ------------------------------------------------------------------------------
TRUNCATE TABLE ecom.product_images;

INSERT INTO ecom.product_images 
(product_id, image_url, is_primary, created_at, modified_at, created_by, modified_by) 
VALUES
-- Product 1: ASUS ROG Phone
(1, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(1, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 2: ASUS ZenBook
(2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(2, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 3: Apple iPhone 14
(3, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(3, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 4: Apple MacBook Pro
(4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(4, 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 5: NVIDIA RTX 4090
(5, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(5, 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 6: NVIDIA RTX 4080
(6, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 7: Sony PlayStation 5
(7, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(7, 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 8: Sony WH-1000XM5
(8, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(8, 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 9: Nike Air Max
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(9, 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 10: Nike Dri-FIT T-Shirt
(10, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 11: The Ordinary Niacinamide
(11, 'https://images.unsplash.com/photo-1608248597359-00f7e1b525f0?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(11, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 12: The Ordinary Peeling Solution
(12, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 13: Samsung Galaxy S23
(13, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(13, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80', 0, NOW(), NOW(), 1, 1),

-- Product 14: Samsung Galaxy Watch
(14, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 15: Logitech MX Master 3
(15, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 16: Logitech G Pro Keyboard
(16, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 17: Dyson V15 Vacuum
(17, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 18: Dyson Supersonic
(18, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 19: Adidas Ultraboost
(19, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 20: Adidas Tracksuit
(20, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 21: Apple AirPods Pro
(21, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 22: Sony Alpha A7 IV
(22, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 23: Samsung 980 Pro SSD
(23, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 24: ASUS ROG Strix Monitor
(24, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 25: Logitech C920 Webcam
(25, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 26: Nike Sports Bra
(26, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 27: Adidas Gym Bag
(27, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 28: Apple iPad Air
(28, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 29: Samsung 4K Smart TV
(29, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),

-- Product 30: Sony Bravia OLED
(30, 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1);


-- ------------------------------------------------------------------------------
-- ၃။ PRODUCT_VARIANT_IMAGE TABLE SAMPLE DATA (Variant 1 မှ 30 အထိ)
-- ------------------------------------------------------------------------------
TRUNCATE TABLE ecom.product_variant_image;

INSERT INTO ecom.product_variant_image 
(product_variant_id, image_url, is_primary, created_at, modified_at, created_by, modified_by) 
VALUES
(1, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(2, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(3, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(4, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(5, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(6, 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(7, 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(8, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(9, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(10, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(11, 'https://images.unsplash.com/photo-1608248597359-00f7e1b525f0?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(12, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(13, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(14, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(15, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(16, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(17, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(18, 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(19, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(20, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(21, 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(22, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(23, 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(24, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(25, 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(26, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(27, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(28, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(29, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1),
(30, 'https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=800&q=80', 1, NOW(), NOW(), 1, 1);

SET FOREIGN_KEY_CHECKS = 1;

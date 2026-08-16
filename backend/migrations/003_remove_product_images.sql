ALTER TABLE products
DROP COLUMN IF EXISTS image_url;

ALTER TABLE order_items
DROP COLUMN IF EXISTS product_image_url;

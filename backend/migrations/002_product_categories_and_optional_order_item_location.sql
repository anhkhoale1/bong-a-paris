CREATE TABLE product_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE products
ADD COLUMN product_category_id TEXT REFERENCES product_categories(id) ON DELETE SET NULL;

CREATE INDEX products_product_category_id_idx ON products (product_category_id);

ALTER TABLE orders
ADD COLUMN delivery_fee BIGINT NOT NULL DEFAULT 0 CHECK (delivery_fee >= 0);

ALTER TABLE order_items
ALTER COLUMN purchase_location DROP NOT NULL;

ALTER TABLE order_items
ALTER COLUMN purchase_location SET DEFAULT '';

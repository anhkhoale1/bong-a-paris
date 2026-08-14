CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_purchase_price BIGINT NOT NULL CHECK (default_purchase_price >= 0),
  default_sale_price BIGINT NOT NULL CHECK (default_sale_price >= 0),
  purchase_location TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (status IN (
    'PURCHASED',
    'SHIPPED_TO_VIETNAM',
    'ARRIVED_IN_VIETNAM',
    'OUT_FOR_DELIVERY',
    'COMPLETED'
  )),
  total_revenue BIGINT NOT NULL CHECK (total_revenue >= 0),
  total_cost BIGINT NOT NULL CHECK (total_cost >= 0),
  total_profit BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_image_url TEXT NOT NULL DEFAULT '',
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  purchase_price BIGINT NOT NULL CHECK (purchase_price >= 0),
  sale_price BIGINT NOT NULL CHECK (sale_price >= 0),
  purchase_location TEXT NOT NULL,
  line_cost BIGINT NOT NULL CHECK (line_cost >= 0),
  line_revenue BIGINT NOT NULL CHECK (line_revenue >= 0),
  line_profit BIGINT NOT NULL
);

CREATE INDEX products_created_at_idx ON products (created_at DESC);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_status_created_at_idx ON orders (status, created_at DESC);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX order_items_product_id_idx ON order_items (product_id);


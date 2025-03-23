CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  about VARCHAR(500),
  price FLOAT NOT NULL,
  
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pseudo VARCHAR (50) NOT NULL,
  password VARCHAR (200) NOT NULL,
  mail VARCHAR (150) NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  total FLOAT,
  payment BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT ,
  updadedAt TIMESTAMP DEFAULT ,
  FOREIGN KEY (user_id) REFERENCES users(id),
);

CREATE TABLE order_products(
  order_id INTEGER,
  product_id INTEGER,
  quantity INTEGER,
  PRIMARY KEY (order_id, product_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE reviews(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  score TYNINT NOT NULL CHECK (score BETWEEN  1 AND 5),
  content VARCHAR(500),
  createdAt TIMESTAMP DEFAULT ,
  updadedAt TIMESTAMP DEFAULT ,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
CREATE TABLE product_reviews(
  product_id INTEGER NOT NULL,
  review_id INTEGER NOT NULL,
  score_total FLOAT,
  PRIMARY KEY (product_id, review_id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);

INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', '60')
  
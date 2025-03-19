CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  about VARCHAR(500),
  price FLOAT
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  pseudo VARCHAR (50),
  password VARCHAR (200),
  mail VARCHAR (150)
);

INSERT INTO products (name, about, price) VALUES
  ('My first game', 'This is an awesome game', '60')
  
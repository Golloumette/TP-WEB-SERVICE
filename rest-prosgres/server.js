	
const express = require("express");
const postgres = require("postgres");
const z = require("zod");
const { createHash } = require('node:crypto');
const app = express();
const port = 8000;
const sql = postgres({ db: "mydb", user: "user", password: "password" });

app.use(express.json());

// Schemas
const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  about: z.string(),
  price: z.number().positive(),
});
const createProductSchema = ProductSchema.omit({id:true});

const UserSchema = z.object({
    pseudo: z.string(),
    mail: z.string(),
    password: z.string()
 });

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/products/:id", async (req, res) => {
try {
    const { id } = req.params;

    // On récupère le produit depuis la base de données en se basant sur l'ID
    const [product] = await sql`
      SELECT * 
      FROM products 
      WHERE id = ${id}`;

    // Si aucun produit n’est trouvé
    if (!product) {
      return res.status(404).json({ error: "Produit non trouvé" });
    }

    // Réponse JSON
    res.json(product);
  } catch (err) {
    // Si la validation échoue ou s'il y a un autre problème
    res.status(400).json({ error: err.message });
  }
});

//Récupére les produits en fonction d'un paramètre
app.get("/products",async (req, res) => {
  try{
    
    const valeur = req.query[Object.keys(req.query)[0]];
    const params = Object.keys(req.query)[0];
   console.log("params :",params,"valeur :",valeur);

// Vérifiez si des paramètres de requête sont fournis
if (Object.keys(req.query).length === 0) {
  return res.status(400).json({ message: "Aucun paramètre fourni" });
}

// Construire dynamiquement la clause WHERE
const conditions = Object.entries(req.query)
  .map(([key, value]) => `${key} = '${value}'`)
  .join(" AND ");

// Construire la requête SQL
const query = `
  SELECT * 
  FROM products
  WHERE ${conditions}
`;

console.log("Requête SQL générée :", query);

// Exécuter la requête SQL
const products = await sql.unsafe(query);
    // Retourner les résultats
    res.json(products);
  } catch (err) {
    console.error("Erreur :", err.message);
    res.status(500).json({ error: err.message });
  }
});

 app.get("/users",async (req, res) => {
    const user = await sql `
    SELECT * 
    FROM users`; 

res.json(user);
});

app.post("/products/",async (req,res) => {

    try{
        const result = createProductSchema.safeParse(req.body);

        if (!result.success){
            res.status(400).json({message: "donnée incorrecte"})
        } else {
           const {name,about,price} = result.data; 
        const [newProduct] = await sql`
          INSERT INTO products (name, about, price)
          VALUES ( ${name}, ${about}, ${price})
          RETURNING *
        `;
       res.status(201).json(newProduct);
    }
    
    } catch(err){
        res.status(500).json({error:err.message});
    }

});
    
app.delete("/products/:id", async (req, res) => {
try {
    const { id } = req.params;

    // On récupère le produit depuis la base de données en se basant sur l'ID
    const [product] = await sql`
      DELETE  
      FROM products 
      WHERE id = ${id}`;
   
    // Réponse JSON
    res.status(202).json(product);
  } catch (err) {
    // Si la validation échoue ou s'il y a un autre problème
    res.status(400).json({ error: err.message });
  }
});

app.post("/users/",async (req,res) => {

    try{
        const result = UserSchema.safeParse(req.body);
        if (!result.success){
            res.status(400).json({message: "donnée incorrecte"})
        } else {

            const hash = createHash('sha512');

            const mdp = result.data.password;
            hash.update(mdp);
            const hashPassword = hash.digest('hex');
           const {pseudo,mail} = result.data; 

        const [newUser] = await sql`
          INSERT INTO users (pseudo, password, mail)
          VALUES ( ${pseudo}, ${hashPassword}, ${mail})
          RETURNING id,pseudo,mail 
        `;

       res.status(201).json(newUser);
    }
    
    } catch(err){
        res.status(500).json({error:err.message});
    }

});

app.patch("/users/:id",async (req,res) => { 
      try{
        const { id } = req.params;
           const result = req.body;
            const columns =Object.keys(result); 
            const user = result;          
          const [newUser] = await sql`
          update users set ${
            sql(user, columns)
          }
          where id = ${ id }
            RETURNING id,pseudo,mail
          `;
          
        res.status(201).json(newUser);
      
      
      } catch(err){
          res.status(500).json({error:err.message});
      }
  
  }
  );

app.put("/users/:id",async (req,res) => {

    try{
      const { id } = req.params;
        const result = UserSchema.safeParse(req.body);
        if (!result.success){
            res.status(400).json({message: "donnée incorrecte"})
        } else {
            const hash = createHash('sha512');

            const mdp = result.data.password;
            hash.update(mdp);
            const hashPassword = hash.digest('hex');
           const {pseudo,mail} = result.data; 

        const [newUser] = await sql`
          UPDATE users 
          SET pseudo = ${pseudo}, password = ${hashPassword}, mail = ${mail}
          WHERE id = ${id}
          RETURNING id,pseudo,mail
        `;
         
       res.status(201).json(newUser);
    }
    
    } catch(err){
        res.status(500).json({error:err.message});
    }

});
app.get("/api/freeToGame", async (req, res) => {
  fetch("https://www.freetogame.com/api/games")
    .then((response) => response.json())
    .then((data) => res.json(data));
});
app.get("orders", async (req, res) => {
  const orders = await sql`
    SELECT * 
    FROM orders`;
  res.json(orders);
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

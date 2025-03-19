	
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

//const responseUserSchema = UserSchema.omit({password:true});

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

app.get("/products",async (req, res) => {
    const product = await sql `
    SELECT * 
    FROM products`;

res.json(product);

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
          RETURNING (pseudo,mail) 
        `;

       res.status(201).json(newUser);
    }
    
    } catch(err){
        res.status(500).json({error:err.message});
    }

});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

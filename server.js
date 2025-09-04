const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const port = 5000

app.use(express.static(__dirname))
app.use(express.urlencoded({extended :true}))

mongoose.connect('mongodb://127.0.0.1:27017/inventory')
const db = mongoose.connection
db.once('open',()=>{
    console.log("mongodb is connected succesfully")
})

const schema = new mongoose.Schema({
       prodid : Number,
       prodname : String,
       price : Number,
       category : String,
       stock : Number
})

const user = mongoose.model("products",schema)

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'basic.html'))
})

app.get('/newproducts',(req,res)=>{
  res.sendFile(path.join(__dirname,'newprod.html'))
})

app.post('/post',async (req,res)=>{
    const{ prodid,prodname,price,category,stock} = req.body
          const usern = new user({
             prodid,
             prodname,
             price,
             category,
             stock
          })
          await usern.save()
          console.log(usern)
          res.sendFile(path.join(__dirname,'success.html'))
})

app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'view.html'));
});

app.get('/products', async (req, res) => {
  try {
    const product = await user.find({}).sort({stock : 1});
    res.json(product); // Return JSON to frontend
  } catch (err) {
    console.error('Error retrieving student data:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/search/product/:prodid',async (req,res)=>{
  const prodid = req.params.prodid;
  try{
    const product = await user.findOne({prodid : prodid});
    if(!product){
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }
    res.json(product)
  } catch(err){
    console.error('error retriving product data',err)
    res.status(500).send('internal error')
  }
})
app.get('/search/category/:category',async (req,res)=>{
  const category = req.params.category;
  try{
    const product = await user.find({category : category}).sort({stock : 1});
    if(product.length === 0){
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }
    res.json(product)
  } catch(err){
    console.error('error retriving product data',err)
    res.status(500).send('internal error')
  }
})

app.get('/delete', (req, res) => {
  res.sendFile(path.join(__dirname, 'delete.html'));
});

app.post('/delete',async (req,res)=>{
  const prodid = req.body.prodid
  try{
    const result = await user.deleteOne({prodid : prodid});
    if(result.deletedCount ===0){
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }
    res.sendFile(path.join(__dirname,'dsucs.html'))
  }
  catch(err){
    console.error('error deleting student',err)
    res.status(500).send('internal server error')
  }
})

app.post('/update-stock', async (req, res) => {
  const { prodid, stock } = req.body;
  try {
    const result = await user.updateOne({ prodid }, { $set: { stock } });
    if (result.matchedCount === 0) return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    res.sendFile(path.join(__dirname, 'upsucess.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating name');
  }
});

app.post('/update-price', async (req, res) => {
  const { prodid, price } = req.body;
  try {
    const result = await user.updateOne({ prodid }, { $set: { price } });
    if (result.matchedCount === 0) return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    res.sendFile(path.join(__dirname, 'upsucess.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating name');
  }
});

app.post('/buy-prod', async (req, res) => {
  const { prodid, stock } = req.body;
  const quantityToSubtract = Number(stock); // quantity to subtract

  if (isNaN(quantityToSubtract) || quantityToSubtract <= 0) {
    return res.status(400).send('Invalid quantity');
  }

  try {
    // Step 1: Find the product by prodid
    const product = await user.findOne({ prodid });

    if (!product) {
      return res.status(404).sendFile(path.join(__dirname, 'notfound.html'));
    }

    // Step 2: Check if enough stock exists
    if (product.stock < quantityToSubtract) {
      return res.status(400).send('Not enough stock available');
    }

    // Step 3: Subtract and update stock
    const newStock = product.stock - quantityToSubtract;

    await user.updateOne({ prodid }, { $set: { stock: newStock } });

    res.sendFile(path.join(__dirname, 'buystocksuc.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating stock');
  }
});


app.listen(port,()=>{
    console.log("server is running")
})
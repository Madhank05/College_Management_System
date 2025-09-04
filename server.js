const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const app = express()
const port = 3000

app.use(express.static(__dirname))
app.use(express.static('updates'));

app.use(express.urlencoded({extended :true}))

mongoose.connect('mongodb://127.0.0.1:27017/student')
const db = mongoose.connection
db.once('open',()=>{
    console.log("mongodb is connected succesfully")
})
const schema = new mongoose.Schema({
    regno : Number,
    name : String,
    email : String,
    dob : Date,
    dept : String
})
const user = mongoose.model("data",schema)
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'collegemanagement.html'))
})

app.get('/newregister',(req,res)=>{
  res.sendFile(path.join(__dirname,'newreg.html'))
})

app.post('/post',async (req,res)=>{
   const{regno,name,email,dob,dept} = req.body
      const usern = new user({
         regno,
         name,
         email,
         dob,
         dept
        })
          await usern.save()
          console.log(usern)
          res.sendFile(path.join(__dirname,'success.html'))
})
app.get('/view', (req, res) => {
  res.sendFile(path.join(__dirname, 'view.html'));
});
app.get('/students', async (req, res) => {
  try {
    const student = await user.find({}).sort({regno : 1});
    res.json(student); // Return JSON to frontend
  } catch (err) {
    console.error('Error retrieving student data:', err);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'search.html'));
});

app.get('/search/:regno',async (req,res)=>{
  const regno = req.params.regno;
  try{
    const student = await user.findOne({regno : regno});
    if(!student){
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }
    res.json(student)
  } catch(err){
    console.error('error retriving student data',err)
    res.status(500).send('internal error')
  }
})
app.get('/search/dept/:dept',async (req,res)=>{
  const dept = req.params.dept;
  try{
    const student = await user.find({dept : dept});
    if(student.length === 0){
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }
    res.json(student)
  } catch(err){
    console.error('error retriving student data',err)
    res.status(500).send('internal error')
  }
})

app.get('/delete', (req, res) => {
  res.sendFile(path.join(__dirname, 'delete.html'));
});

app.post('/delete',async (req,res)=>{
  const regno = req.body.regno
  try{
    const result = await user.deleteOne({regno : regno});
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

app.get('/update', (req,res)=>{
  res.sendFile(path.join(__dirname,'updates','update.html'))
})

app.post('/update-email', async (req, res) => {
  const regno = req.body.regno;
  const email = req.body.email;

  try {
    const result = await user.updateOne(
      { regno: regno },             
      { $set: { email: email } }       
    );

    if (result.matchedCount === 0) {
      return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    }

    res.sendFile(path.join(__dirname, 'upsucess.html')); 
  } catch (err) {
    console.error('Error updating student:', err);
    console.error('Error updating student:', err.stack);

    res.status(500).send('Internal Server Error');
  }
});

app.post('/update-name', async (req, res) => {
  const { regno, name } = req.body;
  try {
    const result = await user.updateOne({ regno }, { $set: { name } });
    if (result.matchedCount === 0) return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    res.sendFile(path.join(__dirname, 'upsucess.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating name');
  }
});

app.post('/update-dob', async (req, res) => {
  const { regno, dob } = req.body;
  try {
    const result = await user.updateOne({ regno }, { $set: { dob } });
    if (result.matchedCount === 0) return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    res.sendFile(path.join(__dirname, 'upsucess.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating name');
  }
});
app.post('/update-dept', async (req, res) => {
  const { regno, dept } = req.body;
  try {
    const result = await user.updateOne({ regno }, { $set: { dept } });
    if (result.matchedCount === 0) return res.status(404).sendFile(path.join(__dirname,'notfound.html'))
    res.sendFile(path.join(__dirname, 'upsucess.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating name');
  }
});

app.listen(port,()=>{
    console.log("server is running")
})



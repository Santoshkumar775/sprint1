const express = require('express');
const app = express();
const bodyparser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();
require('./config/db');
const PORT = 8182;
const cors = require('cors');
const logRoutes = require('./routes/logRoutes');
const authRoutes = require('./Auth/authRoutes');
const reportRoutes = require('./routes/reportRoutes');


app.use(bodyparser.urlencoded({extended:true}));
app.use(express.json());
app.use(cors())


app.get('/',(req,res)=>{
    res.send('go ahead...');
})


app.use('/api/logs', logRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', reportRoutes)



app.listen(PORT, (err)=>{
    if(err) throw err;
    console.log(`server is running on port ${PORT}`);
    
})
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const signup = async(req,res) =>{
    const{name, email, password} = req.body;

    try{
        const hashedPass = await bcrypt.hashSync(password,10);

        const sql = 'insert into users(name,email,password) values(?,?,?)'

        const [rows] = await pool.query(sql, [name,email,hashedPass]);

        res.status(200).json({msg:'user signed in successfully!!!', user_id:rows.insertId})

    }
    catch(err){
                
        res.status(500).json({msg:'error signing in... ', error:err})
    }
}



const login = async(req,res)=>{
    const{email, password} = req.body;

    try{
        const [rows] = await pool.query('select * from users where email=?',[email])
        const user = rows[0];

        if(!user){
            res.status(400).json({msg:'no rcords found...kindly login...'})
        }

        const isPassValid = await bcrypt.compare(password, user.password)
        if(!isPassValid){
            res.status(400).json({msg:'incorrect password...'})
        }

        const token = await jwt.sign({id:user.id}, process.env.secret);
        res.status(200).json({msg:'logged in successfully!!!', token:token, userId: user.id})
    }
    catch(err){
        res.status(500).json({msg:'error logging in....', error:err})
    }
}

const userInfo = async(req,res) =>{

    try{
         const { id } = req.params;

        const sql = 'SELECT id, name, email FROM users WHERE id = ?';

        const [rows] = await pool.query(sql, [id])
        if(rows.length === 0){
            res.status(404).json({msg:'no user found...'})
        }
        res.status(200).json({msg:'user found!!!', user:rows})

    }   
    catch(err){
        res.status(500).json({msg:'error finding user...'})
    }
}    
    
    
    
const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password } = req.body; // sirf jo fields bheje gaye hain

    // Dynamic query generate karna
    const fields = [];
    const values = [];

    if (name) {
      fields.push("name = ?");
      values.push(name);
    }
    if (email) {
      fields.push("email = ?");
      values.push(email);
    }
    if (password) {
      fields.push("password = ?");
      values.push(password); // agar hashed karna ho to yahan hash karein
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields provided for update" });
    }

    values.push(userId); // WHERE ke liye last me userId

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
    const [result] = await pool.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Updated user ko fetch karke bhej rahe hain
    const [updatedUser] = await pool.query("SELECT id, name, email FROM users WHERE id = ?", [userId]);

    res.json({ msg: "Profile updated successfully!", user: updatedUser[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
};



module.exports = {signup, login, userInfo, updateProfile};

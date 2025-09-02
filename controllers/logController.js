// // const { addLog } = require("../models/logModel");
// const pool = require('../config/db');

// const createLog = async (req, res) => {
//   try {
//     console.log('inside createLog');

//     const { task_title, time_spent, mood, energy_level, notes, date } = req.body;
//     const user_id = req.user.id;

//     if (!task_title || !time_spent || !date) {
//       return res.status(400).json({ message: "Required fields are missing" });
//     }

//     const sql = `
//       INSERT INTO logs (user_id, task_title, time_spent, mood, energy_level, notes, date)
//       VALUES (?, ?, ?, ?, ?, ?, ?)
//     `;

//     const [result] = await pool.query(sql, [
//       user_id,
//       task_title,
//       time_spent,
//       mood,
//       energy_level,
//       notes,
//       date,
//     ]);

//     console.log(result);

//     res.status(201).json({
//       message: "Log created successfully",
//       logId: result.insertId,
//     });

//   } catch (error) {
//     console.error("Error in createLog:", error);
//     res.status(500).json({ message: "Server Error", error });
//   }
// };



// const getAllLogs = async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT * FROM logs');

//     return res.status(200).json({
//       msg: 'Logs fetched successfully!',
//       result: rows
//     });

//   } catch (err) {
//     console.log('Error fetching logs:', err);
//     return res.status(500).json({
//       msg: 'Error fetching logs',
//       error: err
//     });
//   }
// };



// const getEachLog = async(req,res)=>{

//   try{
//     const{id} = req.params;
//     console.log(id);
    

//     const sql = 'select * from logs where id=?';
//     const [rows] = await pool.query(sql, [id]);
//     return res.status(201).json({msg:'logs fetched successfull!!!', result:rows})
//   }

// catch(err){
//   return res.status(500).json({msg:'error fetching logs...', error:err})
// }
// };


// const getUserLogs = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const sql = 'SELECT * FROM logs WHERE user_id = ?';
//     const [rows] = await pool.query(sql, [id]);

//     if (rows.length === 0) {
//       return res.status(404).json({ msg: 'No logs found for this user' });
//     }

//     return res.status(200).json({ msg: 'Logs fetched successfully', result: rows });
//   } catch (err) {
//     return res.status(500).json({ msg: 'Error fetching logs', error: err });
//   }
// };




// const updateLog = async (req, res) => {
//   try {
//     const logId = req.params.id;
//     const user_id = req.user.id;
//     const { task_title, time_spent, mood, energy_level, notes, date } = req.body;

//     const sql = `
//       UPDATE logs 
//       SET task_title = ?, time_spent = ?, mood = ?, energy_level = ?, notes = ?, date = ?
//       WHERE id = ? AND user_id = ?
//     `;

//     const [result] = await pool.query(sql, [
//       task_title,
//       time_spent,
//       mood,
//       energy_level,
//       notes,
//       date,
//       logId,
//       user_id,
//     ]);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ message: "Log not found or not authorized" });
//     }

//     res.status(200).json({ message: "Log updated successfully" });

//   } catch (error) {
//     console.error("Error in updateLog:", error);
//     res.status(500).json({ message: "Server error", error });
//   }
// };




// const deleteLog = async(req,res) =>{
//   try{
//       const{id} = req.params;

//       const sql = "delete from logs where id=?"

//       const [rows] = await pool.query(sql,[id]);
//       return res.status(200).json({msg:'log deleted successfully!!!', deleted_log:rows})
//   }
//   catch(err){
//     console.log(err);
    
//     return res.status(500).json({msg:'error deleting log...', error:err})
//   }
  
// }

// module.exports = { createLog, getAllLogs, getUserLogs, updateLog, deleteLog};







const pool = require('../config/db');

// Create a new log
const createLog = async (req, res) => {
  try {
    console.log('Inside createLog');

    const { task_title, time_spent, mood, energy_level, notes, date } = req.body;
    const user_id = req.user?.id; // Ensure auth middleware sets this

    if (!task_title || !time_spent || !date) {
      return res.status(400).json({ message: "Required fields are missing" });
    }

    const sql = `
      INSERT INTO logs (user_id, task_title, time_spent, mood, energy_level, notes, date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(sql, [
      user_id,
      task_title,
      time_spent,
      mood || null,
      energy_level || null,
      notes || null,
      date,
    ]);

    res.status(201).json({
      message: "Log created successfully",
      logId: result.insertId,
    });

  } catch (error) {
    console.error("Error in createLog:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get all logs (Admin use)
const getAllLogs = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM logs ORDER BY date DESC');

    res.status(200).json({
      message: 'Logs fetched successfully',
      result: rows
    });

  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

// Get logs for a specific user
const getUserLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = 'SELECT * FROM logs WHERE user_id = ? ORDER BY date DESC';
    const [rows] = await pool.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(200).json({ message: 'No logs found for this user', result: [] });
    }

    res.status(200).json({ message: 'Logs fetched successfully', result: rows });

  } catch (err) {
    console.error('Error in getUserLogs:', err);
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

// Update a log
const updateLog = async (req, res) => {
  try {
    const logId = req.params.id;
    const user_id = req.user?.id;
    const { task_title, time_spent, mood, energy_level, notes, date } = req.body;

    const sql = `
      UPDATE logs 
      SET task_title = ?, time_spent = ?, mood = ?, energy_level = ?, notes = ?, date = ?
      WHERE id = ? AND user_id = ?
    `;

    const [result] = await pool.query(sql, [
      task_title,
      time_spent,
      mood || null,
      energy_level || null,
      notes || null,
      date,
      logId,
      user_id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Log not found or not authorized" });
    }

    res.status(200).json({ message: "Log updated successfully" });

  } catch (error) {
    console.error("Error in updateLog:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a log
const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    const sql = "DELETE FROM logs WHERE id = ? AND user_id = ?";
    const [result] = await pool.query(sql, [id, user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Log not found or not authorized" });
    }

    res.status(200).json({ message: 'Log deleted successfully' });

  } catch (err) {
    console.error("Error deleting log:", err);
    res.status(500).json({ message: 'Error deleting log', error: err.message });
  }
};


module.exports = { createLog, getAllLogs, getUserLogs, updateLog, deleteLog};

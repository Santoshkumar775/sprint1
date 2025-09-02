import { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

export default function Dashboard({ onLogout }) {
  const [userData, setUserData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Log modal
  const [showModal, setShowModal] = useState(false);
  const [newLog, setNewLog] = useState({
    task_title: "",
    time_spent: "",
    mood: "",
    energy_level: "",
    notes: "",
    date: "",
  });

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "" });

  // Edit log modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLog, setEditLog] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId || !token) return;

    axios
      .get(`http://localhost:8182/api/auth/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const user = Array.isArray(res.data.user) ? res.data.user[0] : res.data;
        setUserData(user);
        setProfileData({ name: user.name, email: user.email });

        return axios.get(`http://localhost:8182/api/logs/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      })
      .then((res) => {
        setLogs(res.data.result || []);
      })
      .catch((err) => console.error(err));
  }, [userId, token]);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (!fromDate && !toDate) return true;
    const logDate = new Date(log.date).setHours(0, 0, 0, 0);
    const from = fromDate ? new Date(fromDate).setHours(0, 0, 0, 0) : null;
    const to = toDate ? new Date(toDate).setHours(0, 0, 0, 0) : null;
    return (!from || logDate >= from) && (!to || logDate <= to);
  });

  // Handle add log
  const handleAddLog = () => {
    if (!newLog.task_title || !newLog.time_spent || !newLog.date) {
      alert("Please fill all required fields.");
      return;
    }

    axios
      .post(
        "http://localhost:8182/api/logs",
        { ...newLog, user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => axios.get(`http://localhost:8182/api/logs/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }))
      .then((res) => {
        setLogs(res.data.result || []);
        setShowModal(false);
        setNewLog({ task_title: "", time_spent: "", mood: "", energy_level: "", notes: "", date: "" });
      })
      .catch((err) => console.error("Error adding log:", err));
  };

  // Handle delete
  const handleDeleteLog = (logId) => {
    axios.delete(`http://localhost:8182/api/logs/${logId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => setLogs(logs.filter((log) => log.id !== logId)))
    .catch(err => console.error("Error deleting log:", err));
  };

  // Handle edit
  const handleEditSave = () => {
    if (!editLog) return;

    axios.put(`http://localhost:8182/api/logs/${editLog.id}`, editLog, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setLogs(logs.map((log) => (log.id === editLog.id ? editLog : log)));
      setShowEditModal(false);
    })
    .catch(err => console.error("Error updating log:", err));
  };

  // Handle profile update
  const handleProfileSave = () => {
    axios.patch(`http://localhost:8182/api/auth/${userId}`, profileData, {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then(() => {
      setUserData({ ...userData, ...profileData });
      setShowProfileModal(false);
    })
    .catch(err => console.error("Error updating profile:", err));
  };

  // Handle report download
  const handleDownloadReport = () => {
    axios.get(`http://localhost:8182/api/users/${userId}/report`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    }).then((res) => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.pdf");
      document.body.appendChild(link);
      link.click();
    }).catch(err => console.error("Error downloading report:", err));
  };

  if (!userData) return <p>Loading...</p>;

  // Analytics Data
  const moodData = [
    { name: "Happy", value: logs.filter((l) => l.mood === "happy").length },
    { name: "Neutral", value: logs.filter((l) => l.mood === "neutral").length },
    { name: "Sad", value: logs.filter((l) => l.mood === "sad").length },
  ];
  const energyData = [
    { name: "Low", value: logs.filter((l) => l.energy_level === "low").length },
    { name: "Medium", value: logs.filter((l) => l.energy_level === "medium").length },
    { name: "High", value: logs.filter((l) => l.energy_level === "high").length },
  ];

  // Suggestion
  const latestLog = logs[0];
  let suggestion = "Keep tracking your mood and energy!";
  if (latestLog) {
    if (latestLog.mood === "sad") suggestion = "Try meditation or talk to a friend.";
    if (latestLog.mood === "neutral") suggestion = "A walk can refresh you.";
    if (latestLog.mood === "happy") suggestion = "Keep it up 🎉";
    if (latestLog.energy_level === "low") suggestion += " Take a nap or healthy snack.";
    if (latestLog.energy_level === "high") suggestion += " Great time for focused work!";
  }

  return (
    <div className="container py-4">
      <h1 className="mb-4 text-primary">Welcome, {userData.name} 👋</h1>

      {/* User Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body bg-light">
          <p><strong>Username:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>User ID:</strong> {userData.id}</p>
          <button className="btn btn-warning me-2" onClick={() => setShowProfileModal(true)}>Edit Profile</button>
          <button className="btn btn-success me-2" onClick={handleDownloadReport}>Download Report</button>
          <button className="btn btn-danger" onClick={onLogout}>Logout</button>
        </div>
      </div>

      {/* Activity Logs */}
      <h2>Your Activity Logs</h2>
      <button className="btn btn-primary mb-3" onClick={() => setShowModal(true)}>Add New Log</button>

      {/* Filters */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="form-control" style={{ maxWidth: "200px" }} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="form-control" style={{ maxWidth: "200px" }} />
        <button className="btn btn-secondary" onClick={() => { setFromDate(""); setToDate(""); }}>Clear Filters</button>
      </div>

      {/* Logs Table */}
      <div className="table-responsive">
        <table className="table table-striped table-bordered table-hover">
          <thead>
            <tr style={{ background: "#4CAF50", color: "white" }}>
              <th>Date</th>
              <th>Task Title</th>
              <th>Time Spent</th>
              <th>Mood</th>
              <th>Energy Level</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.date).toLocaleDateString()}</td>
                <td>{log.task_title}</td>
                <td>{log.time_spent} min</td>
                <td>{log.mood}</td>
                <td>{log.energy_level}</td>
                <td>{log.notes}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2" onClick={() => { setEditLog(log); setShowEditModal(true); }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLog(log.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Analytics Section */}
      <h2 className="mt-5 text-primary">Your Analytics</h2>
      <div className="row">
        <div className="col-md-6 d-flex justify-content-center">
          <PieChart width={400} height={300}>
            <Pie data={moodData} cx="50%" cy="50%" outerRadius={120} dataKey="value">
              {moodData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#4caf50", "#ff9800", "#f44336"][index % 3]} />
              ))}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </div>
        <div className="col-md-6 d-flex justify-content-center">
          <BarChart width={400} height={300} data={energyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" /><YAxis allowDecimals={false} />
            <Tooltip /><Legend />
            <Bar dataKey="value" fill="#2196f3" />
          </BarChart>
        </div>
      </div>

      {/* Suggestions */}
      <div className="card shadow-sm mt-4">
        <div className="card-body bg-light">
          <h4>💡 Suggestion</h4>
          <p>{suggestion}</p>
        </div>
      </div>

      {/* Add Log Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton><Modal.Title>Add New Log</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" type="text" placeholder="Task Title" value={newLog.task_title} onChange={(e) => setNewLog({ ...newLog, task_title: e.target.value })} />
            <Form.Control className="mb-2" type="number" placeholder="Time Spent (min)" value={newLog.time_spent} onChange={(e) => setNewLog({ ...newLog, time_spent: e.target.value })} />
            <Form.Select className="mb-2" value={newLog.mood} onChange={(e) => setNewLog({ ...newLog, mood: e.target.value })}>
              <option value="">Select Mood</option><option value="happy">Happy</option><option value="neutral">Neutral</option><option value="sad">Sad</option>
            </Form.Select>
            <Form.Select className="mb-2" value={newLog.energy_level} onChange={(e) => setNewLog({ ...newLog, energy_level: e.target.value })}>
              <option value="">Select Energy Level</option><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </Form.Select>
            <Form.Control className="mb-2" as="textarea" placeholder="Notes" value={newLog.notes} onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })} />
            <Form.Control className="mb-2" type="date" value={newLog.date} onChange={(e) => setNewLog({ ...newLog, date: e.target.value })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleAddLog}>Add Log</Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Log Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Log</Modal.Title></Modal.Header>
        <Modal.Body>
          {editLog && (
            <Form>
              <Form.Control className="mb-2" type="text" value={editLog.task_title} onChange={(e) => setEditLog({ ...editLog, task_title: e.target.value })} />
              <Form.Control className="mb-2" type="number" value={editLog.time_spent} onChange={(e) => setEditLog({ ...editLog, time_spent: e.target.value })} />
              <Form.Select className="mb-2" value={editLog.mood} onChange={(e) => setEditLog({ ...editLog, mood: e.target.value })}>
                <option value="happy">Happy</option><option value="neutral">Neutral</option><option value="sad">Sad</option>
              </Form.Select>
              <Form.Select className="mb-2" value={editLog.energy_level} onChange={(e) => setEditLog({ ...editLog, energy_level: e.target.value })}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </Form.Select>
              <Form.Control className="mb-2" as="textarea" value={editLog.notes} onChange={(e) => setEditLog({ ...editLog, notes: e.target.value })} />
              <Form.Control className="mb-2" type="date" value={editLog.date?.split("T")[0]} onChange={(e) => setEditLog({ ...editLog, date: e.target.value })} />
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleEditSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)}>
        <Modal.Header closeButton><Modal.Title>Edit Profile</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
            <Form.Control className="mb-2" type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowProfileModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleProfileSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

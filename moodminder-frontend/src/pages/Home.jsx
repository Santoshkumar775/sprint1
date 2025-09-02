import { useEffect, useState } from "react";
import axios from "axios";

function Home() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get("http://localhost:8182/api/logs", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then((res) => {
      setLogs(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Welcome to Your Dashboard</h2>
      {logs.length > 0 ? (
        <ul className="list-group">
          {logs.map((log) => (
            <li key={log.id} className="list-group-item">
              <strong>{log.mood}</strong> - {log.description}
            </li>
          ))}
        </ul>
      ) : (
        <p>No logs found. Start by adding a new log!</p>
      )}
    </div>
  );
}

export default Home;

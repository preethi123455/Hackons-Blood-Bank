import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get("http://localhost:8000/api/pending-users");
      setPendingUsers(response.data.pendingUsers);
    } catch (error) {
      console.error("Error fetching pending users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const approveUser = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/approve-user/${id}`);
      setMessage("✅ User approved successfully");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error approving user:", error);
      setMessage("❌ Error approving user");
    }
  };

  const rejectUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/reject-user/${id}`);
      setMessage("❌ User rejected successfully");
      fetchPendingUsers();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setMessage("❌ Error rejecting user");
    }
  };

  const isImage = (filePath) => {
    return /\.(jpg|jpeg|png|webp)$/i.test(filePath);
  };

  return (
    <div className="admin-container">
      <h2>🛡 Admin Approval Panel</h2>
      {message && <p className="status-msg">{message}</p>}

      {loading ? (
        <p>Loading pending users...</p>
      ) : pendingUsers.length === 0 ? (
        <p>No pending user requests.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingUsers.map((user) => {
              const fileUrl = user.documentPath
                ? `http://localhost:8000/${user.documentPath.replace(/\\/g, "/")}`
                : null;

              return (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {fileUrl ? (
                      isImage(fileUrl) ? (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                          <img src={fileUrl} alt="Document" width="60" style={{ borderRadius: "6px" }} />
                        </a>
                      ) : (
                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" download>
                          📄 View PDF
                        </a>
                      )
                    ) : (
                      "No document"
                    )}
                  </td>
                  <td>
                    <button className="approve-btn" onClick={() => approveUser(user._id)}>
                      ✅ Approve
                    </button>
                    <button className="reject-btn" onClick={() => rejectUser(user._id)}>
                      ❌ Reject
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;

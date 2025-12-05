import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingDonors, setPendingDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Fetch Pending Users + Donors
  const fetchPendingData = async () => {
    try {
      const usersRes = await axios.get("http://localhost:8000/api/pending-users");
      const donorsRes = await axios.get("http://localhost:8000/api/pending-donors");

      setPendingUsers(usersRes.data.pendingUsers || []);
      setPendingDonors(donorsRes.data.pendingDonors || []);
    } catch (error) {
      console.error("Error fetching pending data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingData();
  }, []);

  // Approve user
  const approveUser = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/approve-user/${id}`);
      setMessage("✅ User approved successfully");
      fetchPendingData();
    } catch (error) {
      console.error("Error approving user:", error);
      setMessage("❌ Error approving user");
    }
  };

  // Reject user
  const rejectUser = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/reject-user/${id}`);
      setMessage("❌ User rejected");
      fetchPendingData();
    } catch (error) {
      console.error("Error rejecting user:", error);
      setMessage("❌ Error rejecting user");
    }
  };

  // Approve donor
  const approveDonor = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/approve-donor/${id}`);
      setMessage("✅ Donor approved successfully");
      fetchPendingData();
    } catch (error) {
      console.error("Error approving donor:", error);
      setMessage("❌ Error approving donor");
    }
  };

  // Reject donor
  const rejectDonor = async (id) => {
    try {
      await axios.delete(`http://localhost:8000/api/reject-donor/${id}`);
      setMessage("❌ Donor rejected");
      fetchPendingData();
    } catch (error) {
      console.error("Error rejecting donor:", error);
      setMessage("❌ Error rejecting donor");
    }
  };

  // Detect image file type
  const isImage = (mime) => mime && mime.startsWith("image/");

  return (
    <div className="admin-container">
      <h2>🛡 Admin Approval Panel</h2>

      {message && <p className="status-msg">{message}</p>}

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <>
          {/* ---------------------- USERS TABLE ---------------------- */}
          <h3>👤 Pending Users</h3>

          {pendingUsers.length === 0 ? (
            <p>No pending users.</p>
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
                {pendingUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      {user.documentBase64 ? (
                        isImage(user.documentType) ? (
                          <img
                            src={`data:${user.documentType};base64,${user.documentBase64}`}
                            alt="Document"
                            width="60"
                            style={{ borderRadius: "6px", cursor: "pointer" }}
                            onClick={() =>
                              window.open(
                                `data:${user.documentType};base64,${user.documentBase64}`
                              )
                            }
                          />
                        ) : (
                          <a
                            href={`data:${user.documentType};base64,${user.documentBase64}`}
                            download={user.documentName}
                          >
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
                ))}
              </tbody>
            </table>
          )}

          {/* ---------------------- DONORS TABLE ---------------------- */}
          <h3>🩸 Pending Donors</h3>

          {pendingDonors.length === 0 ? (
            <p>No pending donor registrations.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Blood Type</th>
                  <th>Weight</th>
                  <th>Location</th>
                  <th>Medical Conditions</th>
                  <th>Aadhaar</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pendingDonors.map((d) => (
                  <tr key={d._id}>
                    <td>{d.name}</td>
                    <td>{d.email}</td>
                    <td>{d.phone}</td>
                    <td>{d.age}</td>
                    <td>{d.gender}</td>
                    <td>{d.bloodType}</td>
                    <td>{d.weight}</td>
                    <td>{d.location}</td>
                    <td>{d.medicalConditions || "None"}</td>

                    <td>
                      {d.aadharBase64 ? (
                        isImage(d.aadharType) ? (
                          <img
                            src={`data:${d.aadharType};base64,${d.aadharBase64}`}
                            width="60"
                            style={{ borderRadius: "6px", cursor: "pointer" }}
                            onClick={() =>
                              window.open(`data:${d.aadharType};base64,${d.aadharBase64}`)
                            }
                            alt="Aadhaar"
                          />
                        ) : (
                          <a
                            href={`data:${d.aadharType};base64,${d.aadharBase64}`}
                            download={`Aadhaar_${d.name}`}
                          >
                            📄 View PDF
                          </a>
                        )
                      ) : (
                        "No document"
                      )}
                    </td>

                    <td>
                      <button className="approve-btn" onClick={() => approveDonor(d._id)}>
                        ✅ Approve
                      </button>

                      <button className="reject-btn" onClick={() => rejectDonor(d._id)}>
                        ❌ Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

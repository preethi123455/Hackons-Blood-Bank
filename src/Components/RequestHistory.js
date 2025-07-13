import React, { useEffect, useState } from "react";

export default function RequestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/request-history");
        const result = await res.json();

        if (!res.ok) {
          setErrorMsg(result.message || "Failed to fetch history");
        } else {
          setHistory(result.data || []);
        }
      } catch (error) {
        setErrorMsg("❌ Error fetching history: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div style={styles.page}>
      <h1 style={styles.header}>🩸 Blood Request History</h1>

      {loading ? (
        <p style={styles.statusText}>⏳ Loading...</p>
      ) : errorMsg ? (
        <p style={{ ...styles.statusText, color: "#b00020" }}>{errorMsg}</p>
      ) : history.length === 0 ? (
        <p style={styles.statusText}>No blood requests found.</p>
      ) : (
        <div style={styles.cardContainer}>
          {history.map((entry) => (
            <div key={entry._id} style={styles.card}>
              <p><strong>Date:</strong> {new Date(entry.createdAt).toLocaleString()}</p>
              <p><strong>Patient:</strong> {entry.patientName}</p>
              <p><strong>Gender:</strong> {entry.gender}</p>
              <p><strong>Blood Group:</strong> {entry.bloodGroup}</p>
              <p><strong>Type Requested:</strong> {entry.bloodType}</p>
              <p><strong>Quantity:</strong> {entry.quantity}</p>
              <p><strong>Required Date:</strong> {entry.requiredDate}</p>
              <p><strong>City:</strong> {entry.city}</p>
              <p><strong>Donation Location:</strong> {entry.donationLocation}</p>
              <p><strong>Attendee:</strong> {entry.attendeeName}</p>
              <p><strong>Contact:</strong> {entry.attendeeMobile}</p>
              {entry.requisitionFile && (
                <p><strong>Requisition File:</strong> {entry.requisitionFile}</p>
              )}
              <p><strong>Status:</strong> <span style={styles.pending}>Pending</span></p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: "#ffffff",
    minHeight: "100vh",
    padding: "30px",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#b00020",
  },
  header: {
    fontSize: "2.5rem",
    textAlign: "center",
    color: "#b00020",
    marginBottom: "30px",
    fontWeight: "bold",
    borderBottom: "2px solid #b00020",
    paddingBottom: "10px",
  },
  statusText: {
    textAlign: "center",
    fontSize: "1.2rem",
    color: "#555",
  },
  cardContainer: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  card: {
    backgroundColor: "#fff0f0",
    border: "1px solid #ffccd5",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(255, 0, 0, 0.1)",
    transition: "transform 0.2s",
  },
  pending: {
    backgroundColor: "#fff0f0",
    color: "#b00020",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "bold",
  },
};

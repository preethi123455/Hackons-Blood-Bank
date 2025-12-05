import React, { useEffect, useState } from "react";
import axios from "axios";

const MatchDonors = () => {
  const [matchedDonors, setMatchedDonors] = useState([]);
  const [matchedBanks, setMatchedBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDataAndMatch = async () => {
      try {
        const donorRes = await axios.get("https://blood-qgas.onrender.com/api/donors");
        const donors = donorRes.data?.donors || [];

        const historyRes = await axios.get("https://blood-qgas.onrender.com/api/request-history");
        const requests = historyRes.data?.data || [];

        const bankRes = await axios.get("https://blood-qgas.onrender.com/fetch-all-bloodbanks");
        const banks = bankRes.data?.bloodBanks || [];

        const donorMatches = [];
        const bankMatches = [];

        donors.forEach((donor) => {
          const donorBlood = donor.bloodType?.toUpperCase().trim();
          const donorLocation = donor.location?.toLowerCase().trim();

          requests.forEach((req) => {
            const reqBlood = req.bloodGroup?.toUpperCase().trim();
            const reqCity = req.city?.toLowerCase().trim();

            if (donorBlood === reqBlood && donorLocation === reqCity) {
              donorMatches.push({ donor, matchedRequest: req });
            }
          });
        });

        requests.forEach((req) => {
          const reqBlood = req.bloodGroup?.toUpperCase().trim();
          const reqCity = req.city?.toLowerCase().trim();
          const reqUnits = parseInt(req.units || "1");

          banks.forEach((bank) => {
            const bankCity = bank.location?.toLowerCase().trim();
            const availableUnitObj = bank.bloodAvailability.find(
              (entry) => entry.bloodGroup?.toUpperCase().trim() === reqBlood
            );

            if (
              bankCity === reqCity &&
              availableUnitObj &&
              availableUnitObj.units >= reqUnits
            ) {
              bankMatches.push({ bank, matchedRequest: req });
            }
          });
        });

        setMatchedDonors(donorMatches);
        setMatchedBanks(bankMatches);
      } catch (err) {
        console.error("❌ Error fetching/matching data:", err.message);
        setError("Failed to fetch or match donor or blood bank data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDataAndMatch();
  }, []);

  const styles = {
    container: {
      padding: "20px",
      fontFamily: "Segoe UI, sans-serif",
      backgroundColor: "#f4f6f8",
      minHeight: "100vh",
    },
    heading: {
      fontSize: "26px",
      fontWeight: "bold",
      marginBottom: "20px",
      color: "#d32f2f",
      textAlign: "center",
    },
    sectionWrapper: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
    },
    column: {
      flex: "1",
      minWidth: "300px",
    },
    subHeading: {
      fontSize: "20px",
      color: "#37474f",
      marginBottom: "10px",
      borderBottom: "2px solid #ccc",
      paddingBottom: "4px",
    },
    card: {
      backgroundColor: "#ffffff",
      border: "1px solid #ddd",
      borderRadius: "12px",
      padding: "16px",
      marginBottom: "16px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    sectionTitle: {
      marginTop: "10px",
      fontWeight: "600",
      color: "#37474f",
    },
    hr: {
      margin: "12px 0",
      border: "none",
      borderBottom: "1px solid #eee",
    },
    info: {
      margin: "4px 0",
      fontSize: "14px",
    },
    error: {
      color: "red",
      textAlign: "center",
    },
    loader: {
      textAlign: "center",
      fontSize: "16px",
      color: "#333",
    },
    noMatch: {
      textAlign: "center",
      fontSize: "16px",
      color: "#555",
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🔍 Donor & Blood Bank Match Results</h1>

      {loading && <p style={styles.loader}>⏳ Loading data...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && !error && (
        <div style={styles.sectionWrapper}>
          <div style={styles.column}>
            <h2 style={styles.subHeading}>🧑‍🤝‍🧑 Matched Donors</h2>
            {matchedDonors.length === 0 ? (
              <p style={styles.noMatch}>No matched donors found.</p>
            ) : (
              matchedDonors.map(({ donor, matchedRequest }, index) => (
                <div key={index} style={styles.card}>
                  <h3>{donor.name}</h3>
                  <p style={styles.info}><strong>📍 Location:</strong> {donor.location}</p>
                  <p style={styles.info}><strong>🩸 Blood Type:</strong> {donor.bloodType}</p>
                  <p style={styles.info}><strong>📞 Phone:</strong> {donor.phone}</p>
                  <p style={styles.info}><strong>🆔 Aadhaar:</strong> {donor.aadhar}</p>
                  <hr style={styles.hr} />
                  <p style={styles.sectionTitle}>📝 Request</p>
                  <p style={styles.info}><strong>👤 Requested by:</strong> {matchedRequest.patientName}</p>
                  <p style={styles.info}><strong>🏙️ City:</strong> {matchedRequest.city}</p>
                  <p style={styles.info}><strong>🩸 Blood Group:</strong> {matchedRequest.bloodGroup}</p>
                </div>
              ))
            )}
          </div>

          <div style={styles.column}>
            <h2 style={styles.subHeading}>🏥 Matching Blood Banks</h2>
            {matchedBanks.length === 0 ? (
              <p style={styles.noMatch}>No matching blood banks found.</p>
            ) : (
              matchedBanks.map(({ bank, matchedRequest }, index) => {
                const bloodEntry = bank.bloodAvailability.find(
                  (b) => b.bloodGroup.toUpperCase().trim() === matchedRequest.bloodGroup.toUpperCase().trim()
                );

                return (
                  <div key={index} style={styles.card}>
                    <h3>{bank.name}</h3>
                    <p style={styles.info}><strong>📍 Location:</strong> {bank.location}</p>
                    <p style={styles.info}><strong>📧 Email:</strong> {bank.email || "N/A"}</p>
                    <hr style={styles.hr} />
                    <p style={styles.sectionTitle}>🩸 Blood Availability</p>
                    <p style={styles.info}><strong>Group:</strong> {bloodEntry?.bloodGroup}</p>
                    <p style={styles.info}><strong>Units Available:</strong> {bloodEntry?.units}</p>
                    <hr style={styles.hr} />
                    <p style={styles.sectionTitle}>📝 Request</p>
                    <p style={styles.info}><strong>👤 Recipient:</strong> {matchedRequest.patientName}</p>
                    <p style={styles.info}><strong>Needed Units:</strong> {matchedRequest.units || "N/A"}</p>
                    <p style={styles.info}><strong>🏙️ City:</strong> {matchedRequest.city}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDonors;

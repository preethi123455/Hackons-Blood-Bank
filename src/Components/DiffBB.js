import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/DiffBB.css";

export default function DiffBB() {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchBloodGroup, setSearchBloodGroup] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const userEmail = localStorage.getItem("email");

  useEffect(() => {
    axios
      .get("https://blood-qgas.onrender.com/fetch-all-bloodbanks")
      .then((res) => {
        const filteredBanks = res.data.bloodBanks.filter(
          (bank) => bank.email !== userEmail
        );
        setBloodBanks(filteredBanks);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blood banks:", err);
        setLoading(false);
      });
  }, [userEmail]);

  const filterBloodBanks = () => {
    return bloodBanks.filter((bank) => {
      const matchedEntries = bank.bloodAvailability.filter((entry) => {
        const matchesBloodGroup =
          searchBloodGroup === "" ||
          entry.bloodGroup.toLowerCase().includes(searchBloodGroup.toLowerCase());

        const matchesDate =
          searchDate === "" ||
          entry.history?.some((h) => {
            const entryDate = new Date(h.date).toISOString().split("T")[0];
            return entryDate === searchDate;
          });

        return matchesBloodGroup && matchesDate;
      });

      return matchedEntries.length > 0;
    });
  };

  const filteredBanks = filterBloodBanks();

  return (
    <div className="diff-bb-container">
      <h2>All Other Blood Banks' Stock Availability</h2>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Blood Group (e.g., A+)"
          value={searchBloodGroup}
          onChange={(e) => setSearchBloodGroup(e.target.value)}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredBanks.length === 0 ? (
        <p>No matching blood bank data found.</p>
      ) : (
        <div className="bb-list">
          {filteredBanks.map((bank) => (
            <div className="bb-card" key={bank._id}>
              <h3>{bank.name}</h3>
              <p><strong>Location:</strong> {bank.location}</p>
              <p><strong>Email:</strong> {bank.email}</p>
              <table>
                <thead>
                  <tr>
                    <th>Blood Group</th>
                    <th>Units</th>
                    <th>History</th>
                  </tr>
                </thead>
                <tbody>
                  {bank.bloodAvailability
                    .filter((entry) => {
                      const matchesBloodGroup =
                        searchBloodGroup === "" ||
                        entry.bloodGroup
                          .toLowerCase()
                          .includes(searchBloodGroup.toLowerCase());

                      const matchesDate =
                        searchDate === "" ||
                        entry.history?.some((h) => {
                          const entryDate = new Date(h.date)
                            .toISOString()
                            .split("T")[0];
                          return entryDate === searchDate;
                        });

                      return matchesBloodGroup && matchesDate;
                    })
                    .map((entry, index) => (
                      <tr key={index}>
                        <td>{entry.bloodGroup}</td>
                        <td>{entry.units}</td>
                        <td>
                          {entry.history?.map((h, i) => (
                            <div key={i}>
                              {new Date(h.date).toLocaleDateString()} (
                              {h.change > 0 ? "+" : ""}
                              {h.change} units)
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

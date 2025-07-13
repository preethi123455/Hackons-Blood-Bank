import React from "react";

export default function MatchingDonors() {
  const donors = [
    { id: 1, bloodGroup: "O+", location: "3km away" },
    { id: 2, bloodGroup: "B+", location: "5km away" },
  ];

  return (
    <div className="min-h-screen bg-white text-red-800 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-red-700">Matching Donors</h1>

      <div className="max-w-xl mx-auto space-y-4">
        {donors.map((donor) => (
          <div key={donor.id} className="border p-4 rounded bg-red-50">
            <p><strong>Blood Group:</strong> {donor.bloodGroup}</p>
            <p><strong>Location:</strong> {donor.location}</p>
            <button className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded">
              Request Contact
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
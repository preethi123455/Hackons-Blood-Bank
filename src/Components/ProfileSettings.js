import React from "react";

export default function ProfileSettings() {
  return (
    <div className="min-h-screen bg-white text-red-800 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-red-700">Profile Settings</h1>

      <form className="max-w-xl mx-auto grid grid-cols-1 gap-4">
        <input type="text" className="border p-2 rounded" placeholder="Name" defaultValue="Receiver Name" />
        <input type="text" className="border p-2 rounded" placeholder="Phone Number" />
        <input type="text" className="border p-2 rounded" placeholder="City" />
        <input type="password" className="border p-2 rounded" placeholder="Change Password" />
        <button type="submit" className="bg-red-700 hover:bg-red-800 text-white py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
}

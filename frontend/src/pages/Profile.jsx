import React, { useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phoneNumber: user?.phoneNumber || "",
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.substring(0, 10) : "",
  });
  const [contacts, setContacts] = useState(user?.trustedContacts || []);
  const [newContact, setNewContact] = useState({ name: "", relationship: "", phoneNumber: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/profile", form);
      setUser(data.user);
      setEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addContact = async () => {
    if (!newContact.name || !newContact.phoneNumber) return;
    const { data } = await api.post("/profile/trusted-contacts", newContact);
    setContacts(data.user.trustedContacts);
    setNewContact({ name: "", relationship: "", phoneNumber: "" });
  };

  const removeContact = async (id) => {
    const { data } = await api.delete(`/profile/trusted-contacts/${id}`);
    setContacts(data.user.trustedContacts);
  };

  const inputClass =
    "mt-1 w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-2.5 outline-none focus:border-cyan-400 disabled:opacity-50";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button
          onClick={() => setEditing((e) => !e)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm"
        >
          <FiEdit2 size={14} /> {editing ? "Cancel Edit" : "Edit Profile"}
        </button>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-cyan-400">Personal Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-white/60">First Name</label>
            <input name="firstName" disabled={!editing} value={form.firstName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-white/60">Last Name</label>
            <input name="lastName" disabled={!editing} value={form.lastName} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-white/60">Email</label>
            <input name="email" disabled value={form.email} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-white/60">Phone Number</label>
            <input name="phoneNumber" disabled={!editing} value={form.phoneNumber} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="text-sm text-white/60">Date of Birth</label>
            <input type="date" name="dateOfBirth" disabled={!editing} value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="font-semibold mb-4 text-cyan-400">Emergency Information · Trusted Contacts</h2>
        <div className="space-y-2 mb-4">
          {contacts.map((c) => (
            <div key={c._id} className="flex items-center justify-between bg-navy-800 rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium">{c.name} <span className="text-white/40">· {c.relationship}</span></p>
                <p className="text-xs text-white/50">{c.phoneNumber}</p>
              </div>
              <button onClick={() => removeContact(c._id)} className="text-accent-red p-2 hover:bg-red-500/10 rounded-lg">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-sm text-white/40">No trusted contacts added yet.</p>}
        </div>

        <div className="grid md:grid-cols-4 gap-2">
          <input
            placeholder="Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Relationship"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="Phone Number"
            value={newContact.phoneNumber}
            onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
            className="bg-navy-800 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none"
          />
          <button
            onClick={addContact}
            className="flex items-center justify-center gap-1 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 rounded-xl text-sm"
          >
            <FiPlus size={14} /> Add Contact
          </button>
        </div>
      </div>

      {editing && (
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-semibold disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button onClick={() => setEditing(false)} className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;

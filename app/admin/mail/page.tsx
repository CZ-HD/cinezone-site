"use client";

import { useState } from "react";

export default function AdminMailPage() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const sendMail = async () => {
    const res = await fetch("/api/admin/send-mail", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
  to: to.split(",").map((e) => e.trim()),
  subject,
  html: `
    <div style="background:#050816;padding:30px;color:white;font-family:Arial">
      <h1 style="color:#00c6ff;">🎬 CineZone HD</h1>

      <div style="
        background:rgba(255,255,255,0.05);
        padding:20px;
        border-radius:14px;
        margin-top:20px;
      ">
        ${message}
      </div>

      <p style="margin-top:25px;color:#999;">
        Message envoyé par l'administration CineZone HD
      </p>
    </div>
  `,
}),

    const data = await res.json();

    if (data.success) {
      alert("✅ Mail envoyé !");
    } else {
      alert("❌ Erreur envoi");
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">
        📧 Centre Mail Admin
      </h1>

      <div className="flex flex-col gap-4 max-w-2xl">

        <input
          type="email"
          placeholder="Emails séparés par des virgules"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="p-3 rounded bg-black border border-cyan-500"
        />

        <input
          type="text"
          placeholder="Sujet"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="p-3 rounded bg-black border border-cyan-500"
        />

        <textarea
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-3 rounded bg-black border border-cyan-500 h-52"
        />

        <button
          onClick={sendMail}
          className="bg-cyan-500 hover:bg-cyan-600 p-3 rounded font-bold"
        >
          🚀 Envoyer le mail
        </button>

      </div>
    </div>
  );
}

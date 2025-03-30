"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("grant_type", "password");

      const response = await fetch("http://100.106.146.72:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "შეცდომა ავტორიზაციაში");
      }

      const data = await response.json();
      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (error) {
      console.error("Error during login:", error);
      setError(error instanceof Error ? error.message : "შეცდომა სერვერთან კავშირისას");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-md w-80">
        <h1 className="text-2xl font-bold mb-4 text-center">ავტორიზაცია</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <input
          className="border p-2 w-full mb-2"
          placeholder="მომხმარებელი"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="პაროლი"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
          onClick={handleLogin}
        >
          ავტორიზაცია
        </button>
      </div>
    </div>
  );
}
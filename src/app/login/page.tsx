"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (!username || !password) {
        setError("გთხოვთ შეავსოთ ყველა ველი");
        return;
      }

      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);
      formData.append("grant_type", "password");

      console.log("Attempting login with:", {
        url: "http://100.106.146.72:8000/login",
        username,
        formData: formData.toString()
      });

      const response = await fetch("http://100.106.146.72:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json"
        },
        body: formData,
      });

      console.log("Response status:", response.status);
      
      const responseData = await response.text();
      console.log("Raw response:", responseData);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseData);
          errorMessage = errorData.detail || "ავტორიზაცია ვერ მოხერხდა";
        } catch {
          errorMessage = "სერვერთან კავშირი ვერ მოხერხდა";
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseData);
      if (!data.access_token) {
        throw new Error("ტოკენი ვერ მოიძებნა პასუხში");
      }

      localStorage.setItem("access_token", data.access_token);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setError(error instanceof Error ? error.message : "შეცდომა სერვერთან კავშირისას");
    } finally {
      setIsLoading(false);
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
          disabled={isLoading}
        />
        <input
          type="password"
          className="border p-2 w-full mb-4"
          placeholder="პაროლი"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          onKeyPress={(e) => e.key === "Enter" && handleLogin()}
        />
        <button
          className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-gray-400"
          onClick={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? "მიმდინარეობს..." : "ავტორიზაცია"}
        </button>
      </div>
    </div>
  );
}
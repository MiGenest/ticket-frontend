"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "open" | "in_progress" | "closed" | "resolved";
  department: string;
  created_by: User;
  assigned_to?: User | null;
}

interface TicketFormProps {
  onSubmit: (ticket: Ticket) => void;
}

export default function TicketForm({ onSubmit }: TicketFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://100.106.146.72:8000/me", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.detail || "მომხმარებლის ინფორმაციის წამოღება ვერ მოხერხდა");
        }

        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError(error instanceof Error ? error.message : "მომხმარებლის ინფორმაციის წამოღება ვერ მოხერხდა");
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handleSubmit = async () => {
    if (!title || !description || !department) {
      setError("გთხოვთ შეავსოთ ყველა სავალდებულო ველი");
      return;
    }

    if (!currentUser) {
      setError("გთხოვთ გაიაროთ ავტორიზაცია");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("http://100.106.146.72:8000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          department,
          created_by: currentUser.id,
          // Only include assigned_to if it's selected
          ...(assignedTo ? { assigned_to: assignedTo } : {})
        }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "ტიკეტის დამატება ვერ მოხერხდა");
      }

      const result = await response.json();
      console.log("ტიკეტი წარმატებით დაემატა:", result);
      onSubmit(result);

      // Reset form
      setTitle("");
      setDescription("");
      setDepartment("");
      setAssignedTo(null);
      setError("");
    } catch (error) {
      console.error("შეცდომა ტიკეტის დამატებისას:", error);
      setError(error instanceof Error ? error.message : "შეცდომა ტიკეტის დამატებისას");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <Input 
        placeholder="სათაური" 
        value={title} 
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
      />
      <Textarea 
        placeholder="აღწერა" 
        value={description} 
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
        className="min-h-[100px]"
      />
      <select
        value={department}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setDepartment(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">-- აირჩიე დეპარტამენტი --</option>
        <option value="IT">IT</option>
        <option value="HR">HR</option>
        <option value="Finance">Finance</option>
        <option value="Sales">Sales</option>
      </select>

      <select 
        value={assignedTo || ""} 
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssignedTo(e.target.value || null)} 
        className="w-full p-2 border rounded"
      >
        <option value="">-- აირჩიე ასაინი (არასავალდებულო) --</option>
        {currentUser && (
          <option value={currentUser.id}>
            {currentUser.first_name} {currentUser.last_name}
          </option>
        )}
      </select>

      <DialogFooter>
        <Button 
          onClick={handleSubmit} 
          className="bg-red-600 hover:bg-red-700 text-white"
          disabled={isLoading}
        >
          {isLoading ? "იტვირთება..." : "დამატება"}
        </Button>
      </DialogFooter>
    </div>
  );
}
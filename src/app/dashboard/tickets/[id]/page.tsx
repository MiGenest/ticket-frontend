"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Comment {
  id: number;
  author: string;
  message: string;
  createdAt: string;
}

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: "new" | "open" | "pending" | "resolved" | "closed";
  priority: "critical" | "high" | "medium" | "low";
  customer: string;
  department: string;
  assignee: string;
  lastUpdated: string;
  comments: Comment[];
}

export default function TicketDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState<Ticket["status"]>("open");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(`http://100.106.146.72:8000/tickets/${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) throw new Error("ტიკეტის წამოღება ვერ მოხერხდა");
  
        const data = await response.json();
        setTicket(data);
        setNewStatus(data.status);
      } catch (error) {
        console.error("Error fetching ticket:", error);
        setError("ტიკეტის წამოღება ვერ მოხერხდა");
      }
    };
  
    fetchTicket();
  }, [id, router]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !ticket) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://100.106.146.72:8000/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          message: newComment,
          author: "მიშო" // TODO: Get from user session
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("კომენტარის დამატება ვერ მოხერხდა");

      const createdComment = await response.json();

      setTicket(prev => prev && {
        ...prev,
        comments: [...prev.comments, createdComment],
        lastUpdated: new Date().toISOString().split("T")[0]
      });

      setNewComment("");
    } catch (error) {
      console.error("კომენტარის გაგზავნა ვერ მოხერხდა:", error);
      setError("კომენტარის დამატება ვერ მოხერხდა");
    }
  };

  const handleStatusChange = async () => {
    if (!ticket) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`http://100.106.146.72:8000/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("სტატუსის შეცვლა ვერ მოხერხდა");

      setTicket(prev => prev && {
        ...prev,
        status: newStatus,
        lastUpdated: new Date().toISOString().split("T")[0]
      });
    } catch (error) {
      console.error("სტატუსის შეცვლა ვერ მოხერხდა:", error);
      setError("სტატუსის შეცვლა ვერ მოხერხდა");
    }
  };

  if (!ticket) return <div className="p-6">იტვირთება...</div>;

  return (
    <div className="p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">#{ticket.id} — {ticket.title}</h1>
        <Button 
          variant="outline" 
          onClick={() => router.push("/dashboard")}
          className="text-gray-600"
        >
          დაბრუნება
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <p className="text-gray-700">{ticket.description}</p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              სტატუსი: <span className="font-semibold">{ticket.status}</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              პრიორიტეტი: <span className="font-semibold">{ticket.priority}</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              კლიენტი: <span className="font-semibold">{ticket.customer}</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              დეპარტამენტი: <span className="font-semibold">{ticket.department}</span>
            </span>
            <span className="px-3 py-1 bg-gray-100 rounded-full">
              მიმნიჭებელი: <span className="font-semibold">{ticket.assignee}</span>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-4">
            <select 
              value={newStatus} 
              onChange={(e) => setNewStatus(e.target.value as Ticket["status"])}
              className="p-2 border rounded"
            >
              <option value="new">ახალი</option>
              <option value="open">ღია</option>
              <option value="pending">მოლოდინში</option>
              <option value="resolved">გადაწყვეტილი</option>
              <option value="closed">დახურული</option>
            </select>
            <Button onClick={handleStatusChange}>სტატუსის შეცვლა</Button>
          </div>

          <h2 className="font-semibold mb-4">კომენტარები</h2>
          <div className="space-y-4">
            {ticket.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{comment.message}</p>
                <div className="text-xs text-gray-500 mt-1">
                  ავტორი: {comment.author} | {comment.createdAt}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Input
              placeholder="დაამატე კომენტარი..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />
            <Button onClick={handleAddComment}>დამატება</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
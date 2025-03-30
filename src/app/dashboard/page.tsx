"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import NewTicketForm from "@/components/tickets/TicketForm";

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

export default function DashboardPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

        if (!response.ok) throw new Error("მომხმარებლის ინფორმაციის წამოღება ვერ მოხერხდა");

        const data = await response.json();
        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setError("მომხმარებლის ინფორმაციის წამოღება ვერ მოხერხდა");
      }
    };

    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://100.106.146.72:8000/tickets", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (!response.ok) throw new Error("ტიკეტების წამოღება ვერ მოხერხდა");

        const data = await response.json();
        setTickets(data);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setError("ტიკეტების წამოღება ვერ მოხერხდა");
      }
    };

    fetchCurrentUser();
    fetchTickets();
  }, [router]);

  const handleTicketClick = (id: string) => {
    router.push(`/dashboard/tickets/${id}`);
  };

  return (
    <div className="flex h-screen">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4 border-r border-gray-800">
        <div className="mb-8">
          <h1 className="text-xl font-bold mb-4">ტიკეტების სისტემა</h1>
          {currentUser && (
            <div className="text-sm mb-4 text-gray-300">
              მოგესალმებით, {currentUser.first_name}
            </div>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full bg-red-600 hover:bg-red-700">
                ახალი ტიკეტი +
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>ახალი ტიკეტის დამატება</DialogTitle>
              </DialogHeader>
              <NewTicketForm onSubmit={(ticket) => setTickets(prev => [...prev, ticket])} />
            </DialogContent>
          </Dialog>
        </div>
        
        <nav className="space-y-2">
          <a className="block px-4 py-2 rounded hover:bg-gray-800" href="#">დაფა</a>
          <a className="block px-4 py-2 rounded hover:bg-gray-800" href="#">ჩემი ტიკეტები</a>
          <a className="block px-4 py-2 rounded hover:bg-gray-800" href="#">ანგარიშები</a>
          <a className="block px-4 py-2 rounded hover:bg-gray-800" href="#">პარამეტრები</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="p-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}
        
        {/* Top Stats */}
        <div className="p-6 bg-white border-b">
          <div className="grid grid-cols-4 gap-4">
            <Card className="shadow-sm rounded-md border bg-blue-50">
              <CardContent className="p-4">
                <div className="text-sm text-blue-600">ღია</div>
                <div className="text-2xl font-bold">
                  {tickets.filter(t => t.status === "open").length}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm rounded-md border bg-yellow-50">
              <CardContent className="p-4">
                <div className="text-sm text-yellow-600">მიმდინარე</div>
                <div className="text-2xl font-bold">
                  {tickets.filter(t => t.status === "in_progress").length}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm rounded-md border bg-green-50">
              <CardContent className="p-4">
                <div className="text-sm text-green-600">გადაჭრილი</div>
                <div className="text-2xl font-bold">
                  {tickets.filter(t => t.status === "resolved").length}
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm rounded-md border bg-gray-50">
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">დახურული</div>
                <div className="text-2xl font-bold">
                  {tickets.filter(t => t.status === "closed").length}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tickets List */}
        <div className="p-6">
          <div className="mb-6 flex justify-between items-center">
            <Input 
              className="w-64"
              placeholder="ძებნა..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="space-x-2">
              <Button variant="outline">ფილტრი</Button>
              <Button variant="outline">დახარისხება</Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">სათაური</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">დეპარტამენტი</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">სტატუსი</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">შემქმნელი</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">მიმნიჭებელი</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      ტიკეტები არ მოიძებნა
                    </td>
                  </tr>
                ) : (
                  tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleTicketClick(ticket.id)}
                    >
                      <td className="px-6 py-4">#{ticket.id}</td>
                      <td className="px-6 py-4">{ticket.title}</td>
                      <td className="px-6 py-4">{ticket.department}</td>
                      <td className="px-6 py-4">{ticket.status}</td>
                      <td className="px-6 py-4">{ticket.created_by.first_name} {ticket.created_by.last_name}</td>
                      <td className="px-6 py-4">
                        {ticket.assigned_to ? 
                          `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}` : 
                          "მიუნიჭებელი"
                        }
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

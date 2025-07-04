import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const API_URL = 'http://localhost:4000/api';

export default function CreateProject() {
  const [projectName, setProjectName] = useState("");
  const [leadId, setLeadId] = useState<string | undefined>();
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/auth/users`).then(res => res.json()).then(setUsers);
  }, []);

  const handleMemberToggle = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const lead = users.find((u) => u.id === leadId);
    const members = users.filter((u) => selectedMembers.includes(u.id));
    alert(
      `Project: ${projectName}\nLead: ${lead?.name}\nMembers: ${members.map((m) => m.name).join(", ")}`
    );
  };

  const teamLeads = users.filter((u) => u.role === 'Team Leader');
  const teamMembers = users.filter((u) => u.role === 'Team Member');

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-6 bg-white rounded shadow">
      <div>
        <label className="block mb-1 font-medium">Project Name</label>
        <Input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name"
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Team Lead</label>
        <Select value={leadId} onValueChange={setLeadId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a team lead" />
          </SelectTrigger>
          <SelectContent>
            {teamLeads.map((user) => (
              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Team Members</label>
        <div className="space-y-2 border rounded p-2 max-h-40 overflow-y-auto">
          {teamMembers.map((user) => (
            <label key={user.id} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedMembers.includes(user.id)}
                onCheckedChange={() => handleMemberToggle(user.id)}
                id={`member-${user.id}`}
              />
              <span>{user.name}</span>
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" className="w-full">Create Project</Button>
    </form>
  );
} 
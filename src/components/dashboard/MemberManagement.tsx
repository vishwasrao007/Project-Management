import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Users, Plus, Trash2, Edit, Shield, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'http://localhost:4000/api';

interface Member {
  id: string;
  name: string;
  email?: string;
  role: string;
  department: string;
  joinDate?: string;
  status: 'Active' | 'Inactive';
}

const HIERARCHY_LEVELS = [
  'Team Member',
  'Team Leader', 
  'Group Team Leader',
  'Group Head',
  'Leader of Group Head',
  'Managing Director'
];

const DEPARTMENTS = [
  'Frontend Development',
  'Backend Development',
  'Mobile Development',
  'DevOps & Infrastructure',
  'Quality Assurance',
  'UI/UX Design',
  'Product Management',
  'Data Science'
];

const MemberManagement = ({ currentUserRole }: { currentUserRole: string }) => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/auth/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

  // Filter users by role and department
  const filteredUsers = users.filter(user =>
    (roleFilter === '' || user.role === roleFilter) &&
    (departmentFilter === '' || user.department === departmentFilter)
  );

  // Get unique roles and departments for dropdowns
  const uniqueRoles = Array.from(new Set(users.map(u => u.role)));
  const uniqueDepartments = Array.from(new Set(users.map(u => u.department)));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white">Organization Members</h3>
          <p className="text-blue-200">View all users in the organization</p>
        </div>
        {currentUserRole === 'Super Admin' && (
          <span className="text-green-400 font-semibold">Super Admin can add/edit/delete members in User Management</span>
        )}
      </div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="text-white mr-2">Role:</label>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white rounded px-2 py-1"
          >
            <option value="">All</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white mr-2">Department:</label>
          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="bg-gray-800 border-gray-600 text-white rounded px-2 py-1"
          >
            <option value="">All</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>
      <table className="min-w-full bg-gray-900 border border-gray-700 rounded-lg">
        <thead>
          <tr>
            <th className="text-white px-4 py-2 border-b border-gray-700">Name</th>
            <th className="text-white px-4 py-2 border-b border-gray-700">Username</th>
            <th className="text-white px-4 py-2 border-b border-gray-700">Role</th>
            <th className="text-white px-4 py-2 border-b border-gray-700">Department</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id} className="border-b border-gray-800">
              <td className="text-white px-4 py-2">{user.name}</td>
              <td className="text-white px-4 py-2">{user.username}</td>
              <td className="text-white px-4 py-2">{user.role}</td>
              <td className="text-white px-4 py-2">{user.department}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberManagement;

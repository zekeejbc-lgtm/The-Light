
import React, { useEffect, useState } from 'react';
import { User, UserRole } from '../../types';
import { getAllUsers, removeUser, createUser } from '../../services/authService';
import CustomSelect from '../CustomSelect';
import { useToast } from '../../context/ToastContext';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: UserRole.JOURNALIST });
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    const data = await getAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this user?')) {
      addToast('Removing user...', 'loading');
      await removeUser(id);
      addToast('User removed successfully.', 'success');
      load();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    addToast('Creating user account...', 'loading');
    await createUser({
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        avatar: `https://i.pravatar.cc/150?u=${newUser.email}`
    });
    addToast('User added successfully.', 'success');
    setShowAdd(false);
    setNewUser({ name: '', email: '', role: UserRole.JOURNALIST });
    load();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex justify-between items-center border-b-2 border-black dark:border-white pb-4">
         <h3 className="text-2xl font-serif font-black dark:text-white uppercase">User Management</h3>
         <button onClick={() => setShowAdd(!showAdd)} className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-sm uppercase tracking-wider hover:opacity-80">
            {showAdd ? 'Cancel' : '+ Add User'}
         </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-fade-in-down">
           <h4 className="font-bold mb-3 dark:text-white">New User Details</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input required placeholder="Full Name" className="p-2 rounded border dark:bg-brand-dark dark:text-white dark:border-gray-600" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
              <input required type="email" placeholder="Email Address" className="p-2 rounded border dark:bg-brand-dark dark:text-white dark:border-gray-600" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              
              <CustomSelect 
                options={Object.values(UserRole).map(role => ({ value: role, label: role }))}
                value={newUser.role}
                onChange={(val) => setNewUser({...newUser, role: val as UserRole})}
              />
           </div>
           <button type="submit" className="mt-4 bg-brand-cyan text-white px-6 py-2 rounded font-bold w-full hover:bg-cyan-600 shadow-md">Create Account</button>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-black text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-brand-dark divide-y divide-gray-200 dark:divide-gray-700">
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img className="h-10 w-10 rounded-full border border-gray-300" src={user.avatar || 'https://via.placeholder.com/40'} alt="" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-bold rounded-sm uppercase tracking-wider 
                    ${user.role === UserRole.AUDITOR ? 'bg-purple-100 text-purple-800' : 
                      user.role === UserRole.EIC ? 'bg-red-100 text-red-800' : 
                      user.role === UserRole.HEAD ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 font-bold uppercase text-xs border border-red-200 px-2 py-1 rounded hover:bg-red-50">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;

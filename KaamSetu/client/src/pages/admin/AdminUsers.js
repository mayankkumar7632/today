// KaamSetu - Admin Users Page

import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

const AdminUsers = () => {
  const getInitialRole = () => {
    const params = new URLSearchParams(window.location.search);
    const roleFromUrl = params.get('role');
    return ['worker', 'employer', 'admin', ''].includes(roleFromUrl || '') ? (roleFromUrl || '') : '';
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState(getInitialRole);
  const [search, setSearch] = useState('');

  useEffect(() => { loadUsers(); }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (search) params.search = search;
      const response = await adminAPI.getAllUsers(params);
      setUsers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await adminAPI.toggleUserActive(id);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmDelete = window.confirm(`Delete ${user.name} (${user.role})? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      await adminAPI.deleteUser(user._id);
      alert(`${user.name} has been deleted.`);
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  if (loading) return <div className="loading-container"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <h1>Manage Users</h1>

      <form className="search-form" onSubmit={handleSearch}>
        <input type="text" placeholder="Search by name or email" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="filter-tabs">
        {['', 'worker', 'employer', 'admin'].map(r => (
          <button key={r} className={`tab ${roleFilter === r ? 'active' : ''}`}
            onClick={() => setRoleFilter(r)}>
            {r || 'All'}
          </button>
        ))}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                <td>{user.isActive ? 'Active' : 'Blocked'}</td>
                <td>
                  <div className="action-buttons compact-actions">
                    <button className={`btn btn-small ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => handleToggleActive(user._id)}>
                      {user.isActive ? 'Block' : 'Unblock'}
                    </button>
                    <button className="btn btn-small btn-danger" onClick={() => handleDeleteUser(user)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;

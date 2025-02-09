"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from 'react';

export default function GiveAccess() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    // Get file from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const fileName = urlParams.get('file');
    setFile(fileName);

    // Check localStorage only after component mounts (client-side)
    typeof window !== 'undefined' && !window.localStorage.getItem('selectedDrive') && (window.location.href = '/');

    // Fetch users from API
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setUsers(data.usernames);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (username) => {
    setSelectedUsers(prev => 
      prev.includes(username) 
        ? prev.filter(user => user !== username)
        : [...prev, username]
    );
  };

  const handleGiveAccess = async () => {
    if (selectedUsers.length === 0 || !file) {
      alert('Please select at least one user and ensure file is selected');
      return;
    }

    try {
      const responses = await Promise.all(
        selectedUsers.map(username => 
          fetch('http://localhost:5000/api/giveaccess', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: username,
              filename: file
            })
          })
        )
      );

      const allSuccessful = responses.every(response => response.ok);
      if (!allSuccessful) {
        throw new Error('Some access grants failed');
      }

      alert(`Access granted to ${selectedUsers.join(', ')} for file ${file}`);
      window.location.href = '/filebrowser';
    } catch (error) {
      console.error('Error giving access:', error);
      alert('Failed to give access to some users');
    }
  };

  return (
    <div className={styles.main}>
      <h2>Give Access to {file}</h2>
      <div className={styles.userList}>
        {users.map((user, index) => (
          <div
            key={index}
            className={`${styles.userItem} 
              ${selectedUsers.includes(user) ? styles.selected : ''}`}
            onClick={() => handleUserClick(user)}
          >
            {user}
          </div>
        ))}
      </div>
      <button 
        onClick={handleGiveAccess}
        className={`${styles.controlButton} ${selectedUsers.length === 0 ? styles.disabled : ''}`}
        disabled={selectedUsers.length === 0}
      >
        Give Access
      </button>
    </div>
  );
}

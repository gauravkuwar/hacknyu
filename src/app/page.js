"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from 'react';

export default function Home() {
  const [drives, setDrives] = useState([]);

  useEffect(() => {
    // Fetch drives from API on component mount
    const fetchDrives = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/drives');
        if (!response.ok) {
          throw new Error('Failed to fetch drives');
        }
        const data = await response.json();
        setDrives(data.drives);
        localStorage.setItem('drives', JSON.stringify(data.drives));
      } catch (error) {
        console.error('Error fetching drives:', error);
      }
    };

    // Check if drives are in localStorage first
    const storedDrives = localStorage.getItem('drives');
    if (storedDrives) {
      setDrives(JSON.parse(storedDrives));
    } else {
      fetchDrives();
    }
  }, []);

  const handleDriveSelect = (drive) => {
    localStorage.setItem('selectedDrive', drive);
    window.location.href = `/login`;
  };

  const handleAddDrive = async () => {
    const driveName = prompt('Enter new drive name:');
    if (driveName) {
      try {
        const response = await fetch('http://localhost:5000/api/drives', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ drive: driveName })
        });

        if (!response.ok) {
          throw new Error('Failed to add drive');
        }

        const data = await response.json();
        const updatedDrives = [...drives, data.drive];
        setDrives(updatedDrives);
        localStorage.setItem('drives', JSON.stringify(updatedDrives));
      } catch (error) {
        console.error('Error adding drive:', error);
        alert('Failed to add drive');
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {drives.map((drive, index) => (
          <button
            key={index}
            className={styles.driveCard}
            onClick={() => handleDriveSelect(drive)}
          >
            <h3>{drive}</h3>
          </button>
        ))}
      </div>
      <button 
        className={styles.addButton}
        onClick={handleAddDrive}
      >
        Setup New Drive
      </button>
    </div>
  );
}

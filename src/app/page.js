"use client";
import styles from "./page.module.css";

export default function Home() {
  const drives = ["C:", "D:", "E:"];
  const handleDriveSelect = (drive) => {
    localStorage.setItem('selectedDrive', drive);
    window.location.href = `/login`;
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
        onClick={() => alert('Add new drive functionality')}
      >
        Setup New Drive
      </button>
    </div>
  );
}

"use client";
import styles from "./page.module.css";
import { useEffect } from 'react';

export default function Signup() {
  useEffect(() => {
    // Check localStorage only after component mounts (client-side)
    if (typeof window !== 'undefined' && !window.localStorage.getItem('selectedDrive')) {
      window.location.href = '/';
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const drive = localStorage.getItem('selectedDrive');

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    fetch('http://localhost:5000/api/createaccount', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, drive }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Signup failed');
      }
      return response.json();
    })
    .then(data => {
      alert('Account created successfully');
      window.location.href = '/login';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Signup failed. Please try again.');
    });
  };

  return (
    <div className={styles.main}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="username">Username</label>
          <input type="text" id="username" name="username" required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password</label>
          <input type="password" id="password" name="password" required />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" required />
        </div>
        <button type="submit" className={styles.loginButton}>Create Account</button>
      </form>
      <p>
        Already have an account? <a href="/login" className={styles.signupLink}>Login</a>
      </p>
    </div>
  );
}

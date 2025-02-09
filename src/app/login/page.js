"use client";
import React, { useEffect } from 'react';
import styles from "./page.module.css";

export default function Login() {
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

    fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Login failed');
      }
      return response.json();
    })
    .then(data => {
      window.location.href = '/filebrowser';
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Login failed. Please check your credentials.');
      return;
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
        <button type="submit" className={styles.loginButton}>Login</button>
      </form>
      <p>
        Don't have an account? <a href="/signup" className={styles.signupLink}>Sign up</a>
      </p>
    </div>
  );
}

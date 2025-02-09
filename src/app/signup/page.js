"use client";
import styles from "./page.module.css";

export default function Signup() {

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
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
      <button type="submit" className={styles.loginButton}>Sign Up</button>
    </form>
    <p>
      Already have an account? <a href="/login" className={styles.signupLink}>Login</a>
    </p>
  </div>
  );
}

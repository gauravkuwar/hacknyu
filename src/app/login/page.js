"use client";
import styles from "./page.module.css";

export default function Login() {
  if (!localStorage.getItem('selectedDrive')) {
    window.location.href = '/';
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get('username');
    const password = formData.get('password');

    window.location.href = '/filebrowser';
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

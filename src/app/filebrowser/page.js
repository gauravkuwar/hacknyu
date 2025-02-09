"use client";
import styles from "./page.module.css";
import React, { useEffect, useState } from 'react';

export default function FileBrowser() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Check localStorage only after component mounts (client-side)
    typeof window !== 'undefined' && !window.localStorage.getItem('selectedDrive') && (window.location.href = '/');

    // Fetch files from API
    const fetchFiles = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/files', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFiles(data.files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        setFiles(prev => [...prev, file.name]);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    };
    input.click();
  };

  const handleDownload = async () => {
    if (!selectedFile) {
      alert('Please select a file to download');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/download?filename=${selectedFile}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleDelete = async () => {
    if (!selectedFile) {
      alert('Please select a file to delete');
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/delete?filename=${selectedFile}`, {
        method: 'DELETE'
      });
      setFiles(prev => prev.filter(file => file !== selectedFile));
      setSelectedFile(null);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleFileClick = (fileName) => {
    setSelectedFile(prev => prev === fileName ? null : fileName);
  };

  return (
    <>
      <div className={styles.controls}>
        <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto' }}>
          <button onClick={handleUpload} className={styles.controlButton}>
            Upload
          </button>
          <button 
            onClick={handleDownload} 
            className={`${styles.controlButton} ${!selectedFile ? styles.disabled : ''}`}
            disabled={!selectedFile}
          >
            Download
          </button>
          <button 
            onClick={handleDelete} 
            className={`${styles.controlButton} ${!selectedFile ? styles.disabled : ''}`}
            disabled={!selectedFile}
          >
            Delete
          </button>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.fileList}>
          <div className={styles.directoryHeader}>
            /
          </div>
          {files.map((fileName, index) => (
            <div
              key={index}
              className={`${styles.fileItem} 
                ${selectedFile === fileName ? styles.selected : ''}`}
              onClick={() => handleFileClick(fileName)}
            >
              {fileName}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

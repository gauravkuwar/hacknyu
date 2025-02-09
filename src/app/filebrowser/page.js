"use client";
import styles from "./page.module.css";
import React, { useEffect } from 'react';

export default function Login() {
  if (!localStorage.getItem('selectedDrive')) {
    window.location.href = '/';
    return null;
  }

  const [files, setFiles] = React.useState([]);
  const [selectedFile, setSelectedFile] = React.useState(null);
  const [directoryStack, setDirectoryStack] = React.useState(['/']);

  const getCurrentDirectory = () => directoryStack[directoryStack.length - 1];

  useEffect(() => {
    // Simulate fetching files based on current directory
    const currentDir = getCurrentDirectory();
    if (currentDir === '/') {
      setFiles([
        { name: "Documents/", type: "directory" },
        { name: "Pictures/", type: "directory" },
        { name: "test.txt", type: "file" },
      ]);
    } else if (currentDir === "Documents/") {
      setFiles([
        { name: "Work/", type: "directory" },
        { name: "Personal/", type: "directory" },
        { name: "notes.txt", type: "file" },
      ]);
    } else if (currentDir === "Pictures/") {
      setFiles([
        { name: "Vacation/", type: "directory" },
        { name: "Family/", type: "directory" },
        { name: "landscape.jpg", type: "file" },
      ]);
    } else {
      // Handle deeper directories
      setFiles([
        { name: "file1.txt", type: "file" },
        { name: "file2.txt", type: "file" },
      ]);
    }
  }, [directoryStack]);

  const handleUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (e) => {
      const file = e.target.files[0];
      setFiles(prev => [...prev, { name: file.name, type: 'file' }]);
    };
    input.click();
  };

  const handleDownload = () => {
    if (selectedFile) {
      alert(`Downloading ${selectedFile.name}`);
    } else {
      alert('Please select a file to download');
    }
  };

  const handleDelete = () => {
    if (selectedFile) {
      setFiles(prev => prev.filter(file => file.name !== selectedFile.name));
      setSelectedFile(null);
    } else {
      alert('Please select a file to delete');
    }
  };

  const handleFileClick = (file) => {
    if (file.type === 'directory') {
      setDirectoryStack(prev => [...prev, file.name]);
    } else {
      if (selectedFile?.name === file.name) {
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleBack = () => {
    if (directoryStack.length > 1) {
      setDirectoryStack(prev => prev.slice(0, -1));
    }
  };

  const getFullPath = () => {
    return directoryStack.join('');
  };

  return (
    <>
      <div className={styles.controls}>
        <div style={{ marginRight: 'auto' }}>
          {directoryStack.length > 1 && (
            <button onClick={handleBack} className={styles.controlButton}>
              Back
            </button>
          )}
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
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
            {getFullPath()}
          </div>
          {files.map((file, index) => (
            <div
              key={index}
              className={`${styles.fileItem} 
                ${selectedFile?.name === file.name ? styles.selected : ''}
                ${file.type === 'directory' ? styles.directoryItem : ''}`}
              onClick={() => handleFileClick(file)}
            >
              {file.name}
              {file.type === 'directory'}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

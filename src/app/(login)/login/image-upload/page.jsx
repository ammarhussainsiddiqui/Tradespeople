"use client"
import React, { useState } from 'react';

const FileUpload = () => {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleUpload = async () => {
        if (files.length === 0) {
            setMessage("Please select files to upload.");
            return;
        }

        setUploading(true);
        setMessage('');

        const formData = new FormData();
        for (const file of files) {
            formData.append("file", file);
        }

        try {
            const response = await fetch('/api/images', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to upload files");
            }

            const result = await response.json();
            setMessage(result.message || 'Files uploaded successfully');
        } catch (error) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setUploading(false);
            setFiles([]);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-lg font-bold mb-4">Upload Files</h1>
            <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="border border-neutral-300 rounded p-2 mb-4 w-full"
            />
            <button
                onClick={handleUpload}
                disabled={uploading}
                className={`bg-info text-info-foreground py-2 px-4 rounded ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {uploading ? 'Uploading...' : 'Upload Files'}
            </button>
            {message && <p className="mt-4 text-destructive">{message}</p>}
        </div>
    );
};

export default FileUpload;


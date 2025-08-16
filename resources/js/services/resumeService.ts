import axios from '@/lib/axios';

// Note: API routes have been removed. All functionality now uses web routes with Inertia.js
// These functions are kept for backward compatibility but should be replaced with Inertia visits

export const uploadResumes = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('resume_files[]', file);
    });

    const res = await axios.post('/resumes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return res.data;
};

// Deprecated: Use Inertia visits instead of API calls
// Example: router.visit('/roles/{role}/start-analysis', { method: 'post' })
export const analyzeResumes = async (roleId: number) => {
    const res = await axios.post(`/roles/${roleId}/start-analysis`);
    return res.data;
};

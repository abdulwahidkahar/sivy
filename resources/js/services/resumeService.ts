import axios from '@/lib/axios';

export const fetchRecentResumes = async () => {
    const res = await axios.get('/api/resumes');
    return res.data.data;
};

export const uploadResumes = async (files: File[]) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('resume_files[]', file);
    });

    const res = await axios.post('/api/resumes', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return res.data;
};

export const analyzeResumes = async () => {
    const res = await axios.post('/api/resumes/analyze-batch'); // ✅ benar
    return res.data;
};

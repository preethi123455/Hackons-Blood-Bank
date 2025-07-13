import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Styles/Signup.css';

function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [branchArea, setBranchArea] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Donor(Individual)');
    const [documentFile, setDocumentFile] = useState(null);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password || !role) {
            setError('All fields are required');
            return;
        }

        const finalName = role === 'Donor(BloodBank)' ? name + ' - ' + branchArea : name;
        const formData = new FormData();
        formData.append('name', finalName);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('role', role);
        if (documentFile) {
            formData.append('pdf', documentFile);
        }

        try {
            const response = await axios.post('http://localhost:8000/signup', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                alert('Signup request sent successfully!');
                navigate('/login');
            } else {
                setError(response.data.message || 'Signup failed.');
            }
        } catch (err) {
            console.error('Signup error:', err);
            setError('Signup error.');
        }
    };

    return (
        <div className="signup-page">
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <h2>Signup</h2>

                {role === 'Donor(BloodBank)' ? (
                    <>
                        <input
                            type="text"
                            placeholder="Branch Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Branch Area"
                            value={branchArea}
                            onChange={(e) => setBranchArea(e.target.value)}
                        />
                    </>
                ) : (
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                )}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Donor(Individual)">Donor (Individual)</option>
                    <option value="Donor(BloodBank)">Donor (Blood Bank)</option>
                    <option value="Receiver">Receiver</option>
                </select>

                <label>Upload Verification Document (PDF or Image):</label>
                <input
                    type="file"
                    accept=".pdf, image/*"
                    onChange={(e) => setDocumentFile(e.target.files[0])}
                />

                {error && <div className="error">{error}</div>}

                <button type="submit">Sign Up</button>
                <p className="login-link">
                    Already registered? <a href="/login">Log In</a>
                </p>
            </form>
        </div>
    );
}

export default SignUp;

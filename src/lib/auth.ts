export const verifyAdminCredentials = (email: string, pass: string) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
        console.error("Admin credentials not set in environment variables.");
        return false;
    }

    return email === adminEmail && pass === adminPass;
};

export const isAdminEmail = (email?: string | null) => {
    if (!email) return false;
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
    const checkEmail = email.toLowerCase();
    // Hardcoded check for robustness
    return checkEmail === adminEmail || checkEmail === 'mayankbohara0@gmail.com';
};

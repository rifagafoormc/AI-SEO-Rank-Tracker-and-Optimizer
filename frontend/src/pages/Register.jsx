import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, CheckCircle, AlertCircle, Sparkles } from "lucide-react";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setErrorMessage("");
    setSuccessMessage("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match!");
      setIsLoading(false);
      return;
    }

    const password = formData.password;

    const hasMinimumLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>_\-\[\]\\\/`~;'+=]/.test(password);

    if (!hasMinimumLength) {
      setErrorMessage("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (!hasNumber) {
      setErrorMessage("Password must contain at least one number.");
      setIsLoading(false);
      return;
    }

    if (!hasSpecialCharacter) {
      setErrorMessage("Password must contain at least one special character.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      setSuccessMessage(response.data.message || "Account created successfully!");

      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Registration failed";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-[#F5EBDD] dark:from-[#0F0705] dark:to-[#1A0F0A] px-4 transition-colors duration-300 relative overflow-hidden">

      {/* Glow behind the card */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#7A5236]/15 dark:bg-[#A47551]/20 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md bg-white/90 dark:bg-[#251710]/90 rounded-2xl shadow-2xl border border-[#7A5236]/15 dark:border-[#A47551]/25 p-8 transition-colors duration-300 backdrop-blur-sm">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7A5236] to-[#5E3E28] shadow-lg shadow-[#7A5236]/40 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-[#1A0F0A] dark:text-white">
            Create Account
          </h2>
          <p className="text-[#5E3E28]/70 dark:text-[#D4B59E]/70 mt-2">
            Join the AI SEO Rank Tracker
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#7A5236] dark:text-[#D4B59E]">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236] dark:text-[#A47551]" />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7A5236] dark:focus:ring-[#A47551] focus:border-transparent outline-none bg-white dark:bg-[#1A0F0A]/70 border-[#7A5236]/25 dark:border-[#A47551]/30 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 transition-all"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#7A5236] dark:text-[#D4B59E]">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236] dark:text-[#A47551]" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7A5236] dark:focus:ring-[#A47551] focus:border-transparent outline-none bg-white dark:bg-[#1A0F0A]/70 border-[#7A5236]/25 dark:border-[#A47551]/30 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#7A5236] dark:text-[#D4B59E]">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236] dark:text-[#A47551]" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-[#7A5236] dark:focus:ring-[#A47551] focus:border-transparent outline-none bg-white dark:bg-[#1A0F0A]/70 border-[#7A5236]/25 dark:border-[#A47551]/30 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A5236] dark:text-[#A47551] hover:text-[#5E3E28] dark:hover:text-[#D4B59E] transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-[#5E3E28]/60 dark:text-[#D4B59E]/50 mt-1.5 flex items-center gap-1">
              <span>🔒</span> Must be at least 6 characters, 1 number and 1 special character
            </p>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block mb-2 text-sm font-medium text-[#7A5236] dark:text-[#D4B59E]">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7A5236] dark:text-[#A47551]" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#7A5236] dark:focus:ring-[#A47551] focus:border-transparent outline-none bg-white dark:bg-[#1A0F0A]/70 border-[#7A5236]/25 dark:border-[#A47551]/30 text-[#1A0F0A] dark:text-white placeholder:text-[#5E3E28]/50 dark:placeholder:text-[#D4B59E]/40 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#7A5236] hover:bg-[#5E3E28] disabled:bg-[#7A5236]/50 text-white py-3.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#7A5236]/40 hover:shadow-[#7A5236]/60"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Create Account
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-800/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>
                {successMessage}
                <Link
                  to="/login"
                  className="ml-1 underline font-semibold hover:text-emerald-500 dark:hover:text-emerald-300 transition"
                >
                  Click here to Login
                </Link>
              </span>
            </div>
          )}
        </form>

        {/* Footer */}
        <p className="text-center mt-6 text-[#5E3E28]/70 dark:text-[#D4B59E]/60">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[#7A5236] dark:text-[#A47551] font-semibold hover:text-[#5E3E28] dark:hover:text-[#D4B59E] hover:underline transition"
          >
            Login here
          </Link>
        </p>

      </div>
    </div>
  );
}
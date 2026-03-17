import { useState } from "react";
import logo from "/assets/images/logo.png";
import { TextField, Button, Checkbox, FormControlLabel } from "@mui/material";
// import { useAuth } from "./context/UseAuth";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // const { CallLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // CallLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      
      {/* Card */}
      <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-xl p-8">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-10" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold text-white text-center mb-2">
          Sign in to your account
        </h1>

        <p className="text-gray-400 text-sm text-center mb-6">
          Welcome back! Please enter your details
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email */}
          <TextField
            fullWidth
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1e293b",
                borderRadius: "10px",
                color: "white",
                "& fieldset": {
                  borderColor: "#334155"
                },
                "&:hover fieldset": {
                  borderColor: "#6366f1"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1"
                }
              },
              "& input::placeholder": {
                color: "#94a3b8"
              }
            }}
          />

          {/* Password */}
          <TextField
            fullWidth
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#1e293b",
                borderRadius: "10px",
                color: "white",
                "& fieldset": {
                  borderColor: "#334155"
                },
                "&:hover fieldset": {
                  borderColor: "#6366f1"
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#6366f1"
                }
              },
              "& input::placeholder": {
                color: "#94a3b8"
              }
            }}
          />

          {/* Remember + Forgot
          <div className="flex items-center justify-between">
            <FormControlLabel
              control={<Checkbox sx={{ color: "#6366f1" }} />}
              label={
                <span className="text-gray-400 text-sm">
                  Remember me
                </span>
              }
            />

            <span className="text-indigo-400 text-sm cursor-pointer hover:underline">
              Forgot password?
            </span>
          </div> */}

          {/* Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              mt: 1,
              py: 1.5,
              borderRadius: "10px",
              backgroundColor: "#6366f1",
              textTransform: "none",
              fontWeight: "600",
              "&:hover": {
                backgroundColor: "#4f46e5"
              }
            }}
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
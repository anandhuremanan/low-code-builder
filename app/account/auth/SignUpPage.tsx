import { useContext, useState } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const SignupPage = () => {
  const auth = useContext(AuthContext);

  if (!auth) return null;

  const { register, loading, error } = auth;

  const [form, setForm] = useState({
    firstName:"R",
    lastName:"Rahul",
    username: "rahul123",
    email: "rahul.r@example.com",
    phoneNo: "9544577468",
    password: "LowCode@123",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("submit...");
    
    debugger
    e.preventDefault();
    await register(form);
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Paper elevation={3} sx={{ padding: 4, width: 400, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3} align="center">
          Create Account
        </Typography>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        {/* <form onSubmit={handleSubmit}> */}
          <TextField
            label="First Name"
            name="firstName"
            fullWidth
            margin="normal"
            autoComplete="name"
            value={form.firstName}
            onChange={handleChange}
          />
           <TextField
            label="Last Name"
            name="lastName"
            fullWidth
            margin="normal"
            autoComplete="name"
            value={form.lastName}
            onChange={handleChange}
          />

          <TextField
            label="Username"
            name="username"
            fullWidth
            margin="normal"
            autoComplete="username"
            value={form.username}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
            />

          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="normal"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            label="Phone Number"
            name="phoneNo"
            fullWidth
            margin="normal"
            autoComplete="tel"
            value={form.phoneNo}
            onChange={handleChange}
          />


          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, height: 45 }}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? <CircularProgress size={24} /> : "Sign Up"}
          </Button>
        {/* </form> */}
      </Paper>
    </Box>
  );
};

export default SignupPage;
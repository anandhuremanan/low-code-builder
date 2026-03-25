import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useAuth } from "../context/UseAuth";

type SignupProps = {
  onSwitchToLogin: () => void;
};

const textFieldSx = {
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#fff",
    borderRadius: "10px",
    padding: "0px 0px",
    "&.Mui-focused fieldset": {
      borderColor: "#6366f1",
    },
  },
  "& input::placeholder": {
    color: "#94a3b8",
  },
};

export default function Signup({ onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNo: "",
    password: "",
  });
  const { loading, register } = useAuth();

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await register(formData);
  };

  return (
    <>
      <h4 className=" text-center mb-2">Create your account</h4>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>First Name</label>
            <TextField
              fullWidth
              type="text"
              placeholder="Enter First Name"
              value={formData.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              variant="outlined"
              sx={textFieldSx}
            />
          </div>
          <div>
            <label>Last Name</label>
            <TextField
              fullWidth
              type="text"
              placeholder="Enter Last Name"
              value={formData.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              variant="outlined"
              sx={textFieldSx}
            />
          </div>
        </div>
        <div>
          <label>Username</label>
          <TextField
            fullWidth
            type="text"
            placeholder="Choose Username"
            value={formData.username}
            onChange={(event) => updateField("username", event.target.value)}
            variant="outlined"
            sx={textFieldSx}
          />
        </div>
        <div>
          <label>Email</label>
          <TextField
            fullWidth
            type="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={(event) => updateField("email", event.target.value)}
            variant="outlined"
            sx={textFieldSx}
          />
        </div>
        <div>
          <label>Phone Number</label>
          <TextField
            fullWidth
            type="tel"
            placeholder="Enter Phone Number"
            value={formData.phoneNo}
            onChange={(event) => updateField("phoneNo", event.target.value)}
            variant="outlined"
            sx={textFieldSx}
          />
        </div>
        <div>
          <label>Password</label>
          <TextField
            fullWidth
            type="password"
            placeholder="Create password"
            value={formData.password}
            onChange={(event) => updateField("password", event.target.value)}
            variant="outlined"
            sx={textFieldSx}
          />
        </div>
        <div className="forget-signup">
          <div>
            <span>Already have an account?</span>
          </div>
          <button
            type="button"
            className="bg-transparent p-0 text-inherit"
            onClick={onSwitchToLogin}
          >
            <span>Login</span>
          </button>
        </div>
        <div>
          <Button
            type="submit"
            className="btn-signin"
            variant="contained"
            disabled={loading}
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            {loading ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </form>
    </>
  );
}

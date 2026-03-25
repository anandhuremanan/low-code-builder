import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { Form } from "react-router";

type SignupProps = {
  isSubmitting: boolean;
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

export default function Signup({ isSubmitting, onSwitchToLogin }: SignupProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phoneNo: "",
    password: "",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <>
      <h4 className=" text-center mb-2">Create your account</h4>

      <Form method="post" className="login-form">
        <input type="hidden" name="intent" value="signup" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label>First Name</label>
            <TextField
              fullWidth
              type="text"
              placeholder="Enter First Name"
              name="firstName"
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
              name="lastName"
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
            name="username"
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
            name="email"
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
            name="phoneNo"
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
            name="password"
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
            disabled={isSubmitting}
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            {isSubmitting ? "Creating account..." : "Sign up"}
          </Button>
        </div>
      </Form>
    </>
  );
}

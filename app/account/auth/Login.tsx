import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { Form } from "react-router";
import logo from "/assets/images/logo.png";


type LoginProps = {
  error?: string;
  isSubmitting: boolean;
  onSwitchToSignup: () => void;
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

export default function Login({ error, isSubmitting, onSwitchToSignup }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      <div className="login-box">
        <div className="flex justify-center mb-6 login-logo">
          <img src={logo} alt="Logo" className="h-10" />
        </div>
        <h4 className=" text-center mb-2">Sign in</h4>

        <Form method="post" className="login-form">
          <input type="hidden" name="intent" value="login" />
          <div>
            <label>Username</label>
            <TextField
              fullWidth
              type="text"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              variant="outlined"
              sx={textFieldSx}
            />
          </div>
          <div className="mt-2">
            <label>Password</label>
            <TextField
              fullWidth
              type="password"
              name="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              variant="outlined"
              sx={textFieldSx}
            />
          </div>
          <div className="forget-signup">
            <div>
              <span>Forget Password ?</span>
            </div>
            <button
              type="button"
              className="bg-transparent p-0 text-inherit"
              onClick={onSwitchToSignup}
            >
              <span>Sign Up</span>
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
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </div>
          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </Form>
      </div>

    </>
  );
}

import { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useAuth } from "../context/UseAuth";

type LoginProps = {
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

export default function Login({ onSwitchToSignup }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { CallLogin, loading } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await CallLogin({
      username,
      password,
    });
  };

  return (
    <>
      <h4 className=" text-center mb-2">Sign in to your account</h4>

      <form onSubmit={handleSubmit} className="login-form">
        <div>
          <label>Username</label>
          <TextField
            fullWidth
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            variant="outlined"
            sx={textFieldSx}
          />
        </div>
        <div>
          <label>Password</label>
          <TextField
            fullWidth
            type="password"
            placeholder="Enter password"
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
            disabled={loading}
            sx={{
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#4f46e5",
              },
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </div>
      </form>
    </>
  );
}

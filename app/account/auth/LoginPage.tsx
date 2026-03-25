import { useState } from "react";
import logo from "/assets/images/logo.png";
import { TextField, Button } from "@mui/material";
import { useAuth } from "../context/UseAuth";
import { redirect, Form } from "react-router";

const LoginPage = () => {
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const { CallLogin } = useAuth();

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    // let data = {
    //   username,
    //   password,
    // };
    // CallLogin(data);
    redirect("/dashboard");
  };

  return (
    <div className="hero-section-wrap">
      <div className="animbox diagnoal-top-to-right"></div>
      <div className="animbox diagnoal-top-to-left"></div>
      <div className="animbox diagnoal-bottom-to-right"></div>
      <div className="animbox diagnoal-bottom-to-left"></div>
      <div className="animbox center-to-top"></div>

      <div className="login-container">
        <div className="left-box">
          <div className="left-titlebox">
            <h1>JOIN US. </h1>
            <h2>
              Build With <span className="bluetag">Low</span>{" "}
              <span className="txt-bold">Code.</span>
            </h2>
          </div>
        </div>
        <div className="login-box">
          <h4 className=" text-center mb-2">Sign in to your account</h4>

          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-10" />
          </div>

          <Form action="/dashboard" className="login-form">
            <div>
              <label htmlFor="">Username</label>
              <TextField
                fullWidth
                type="Username"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUserName(e.target.value)}
                variant="outlined"
                sx={{
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
                }}
              />
            </div>
            <div>
              <label htmlFor="">Password</label>

              <TextField
                fullWidth
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                    },
                  },
                  "& input::placeholder": {
                    color: "#94a3b8",
                  },
                }}
              />
            </div>
            <div className="forget-signup">
              <div>
                <span>Forget Password ?</span>
              </div>
              <div>
                <span>Sign Up</span>
              </div>
            </div>
            {/* Button */}
            <div className="">
              <Button
                type="submit"
                className="btn-signin"
                variant="contained"
                sx={{
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#4f46e5",
                  },
                }}
              >
                Sign in
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

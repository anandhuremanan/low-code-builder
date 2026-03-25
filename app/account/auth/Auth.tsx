import { useState } from "react";
import { useActionData, useNavigation } from "react-router";
import logo from "/assets/images/logo.png";
import Login from "./Login";
import Signup from "./Signup";

type AuthView = "login" | "signup";

export default function Auth() {
  const [activeView, setActiveView] = useState<AuthView>("login");
  const actionData = useActionData() as { error?: string } | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Logo" className="h-10" />
          </div>

          {actionData?.error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionData.error}
            </div>
          ) : null}

          {activeView === "login" ? (
            <Login
              isSubmitting={isSubmitting}
              onSwitchToSignup={() => setActiveView("signup")}
            />
          ) : (
            <Signup
              isSubmitting={isSubmitting}
              onSwitchToLogin={() => setActiveView("login")}
            />
          )}
        </div>
      </div>
    </div>
  );
}

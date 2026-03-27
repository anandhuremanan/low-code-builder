import { useState } from "react";
import { useActionData, useNavigation } from "react-router";
import Login from "./Login";
import Signup from "./Signup";

type AuthView = "login" | "signup";

export default function Auth() {
  const [activeView, setActiveView] = useState<AuthView>("login");
  const actionData = useActionData() as
    | { error?: string; intent?: AuthView }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const scopedError =
    actionData?.intent === activeView ? actionData.error : undefined;

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
        <>
          {activeView === "login" ? (
            <Login
              error={scopedError}
              isSubmitting={isSubmitting}
              onSwitchToSignup={() => setActiveView("signup")}
            />
          ) : (
            <Signup
              error={scopedError}
              isSubmitting={isSubmitting}
              onSwitchToLogin={() => setActiveView("login")}
            />
          )}
        </>
      </div>
    </div>
  );
}

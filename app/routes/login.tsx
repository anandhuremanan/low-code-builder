import type { Route } from "./+types/login";
import { Link, useNavigate } from "react-router";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Login" },
    { name: "description", content: "Sample login page" },
  ];
}

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (event: any) => {
    // event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold mb-6">Login</h1>

        {/* <form className="space-y-4" onSubmit={handleSubmit}> */}
        <div>
          <label htmlFor="email" className="block text-sm mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          className="w-full border rounded px-3 py-2"
          onClick={handleSubmit}
        >
          Sign in
        </button>
        {/* </form> */}

        <div className="mt-4 text-sm">
          <Link to="/" className="underline">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

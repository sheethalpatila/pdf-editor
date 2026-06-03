import { useState } from "react";

import {
  FileText,
  Lock,
  ShieldCheck,
  User
} from "lucide-react";

const LOGIN_USERNAME = "admin";
const LOGIN_PASSWORD = "admin123";

export default function LocalLogin({
  onLoginSuccess
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      username.trim() === LOGIN_USERNAME &&
      password === LOGIN_PASSWORD
    ) {
      localStorage.setItem(
        "docprecision-local-login",
        "true"
      );

      onLoginSuccess();
      return;
    }

    setError("Invalid username or password");
  };

  return (
    <div className="h-screen w-full bg-[#f3f4f6] flex items-center justify-center px-4">
      <div className="w-full max-w-[430px] rounded-2xl border border-[#e5e7eb] bg-white shadow-xl overflow-hidden">
        <div className="px-7 py-6 border-b border-[#e5e7eb]">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <FileText
                size={26}
                className="text-blue-600"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold text-[#111827]">
                DocPrecision
              </h1>

              <p className="text-sm text-[#6b7280]">
                Local PDF Editor Login
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-7 py-6 space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Username
            </label>

            <div className="h-11 rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3 flex items-center gap-2">
              <User
                size={17}
                className="text-[#6b7280]"
              />

              <input
                value={username}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                placeholder="Enter username"
                className="w-full bg-transparent text-sm outline-none"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#374151]">
              Password
            </label>

            <div className="h-11 rounded-lg border border-[#d1d5db] bg-[#f9fafb] px-3 flex items-center gap-2">
              <Lock
                size={17}
                className="text-[#6b7280]"
              />

              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder="Enter password"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="h-11 w-full rounded-lg bg-blue-600 text-sm font-bold text-white hover:bg-blue-700"
          >
            Login
          </button>

          <div className="flex gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-3 text-xs leading-5 text-[#4b5563]">
            <ShieldCheck
              size={17}
              className="shrink-0 text-emerald-600 mt-0.5"
            />

            <p>
              This is a local-only login gate. Uploaded PDFs still stay in your browser.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from "react";

// Images inside public/ are accessed from the root URL
const brushCorner = "/brush-corner.png";
const brushRight = "/brush-right.png";
const brushLeft = "/brush-left.png";
const star = "/star.png";
const logo = "/logo.png";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Decoration positions relative to the main card
const DECOR = [
  { src : brushLeft , left : 315 , top : 180 , w : 120 , z : 1},
  { src: star, left: 124, top: 310, w: 160, z: 2 },
  { src: brushRight, left: 624, top: 40, w: 160, z: 1 },
  { src: brushCorner, left: 684, top: -35, w: 135, z: 1 },
  { src: brushRight, left: 624, top: 40, w: 160, z: 1 },
  { src: brushCorner, left: 200, top: 400, w: 135, z: 1 },
  { src: star, left: 659, top: 75, w: 115, z: 2 },
];

const COPY = {
  login: {
    title: "Welcome back",
    sub: "Log in to continue to your boards.",
    button: "Log in",
    switchText: "Don't have an account?",
    switchLink: "Register",
    endpoint: "/auth/login",
  },
  register: {
    title: "Create your account",
    sub: "Start planning on your boards.",
    button: "Register",
    switchText: "Already have an account?",
    switchLink: "Log in",
    endpoint: "/auth/register",
  },
};

const inputCls =
  "w-full h-[40px] rounded-lg bg-[#222224] border border-[#333336] px-3 text-sm text-white placeholder-neutral-500 outline-none focus:border-fuchsia-500";

export default function AuthPage({ onAuthSuccess, onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const c = COPY[mode];
  const isRegister = mode === "register";

  const onChange = (e) => {
    setError("");
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const switchMode = () => {
    setMode(isRegister ? "login" : "register");
    setError("");
  };

  const validate = () => {
    if (isRegister && !form.name.trim()) {
      return "Please enter your name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      return "Enter a valid email.";
    }

    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const msg = validate();

    if (msg) {
      setError(msg);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(API_URL + c.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          isRegister
            ? {
                name: form.name.trim(),
                email: form.email,
                password: form.password,
              }
            : {
                email: form.email,
                password: form.password,
              }
        ),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      onAuthSuccess?.(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#161618] flex items-center justify-center p-4">

      {/* MAIN CARD */}
      <div
        className="
          relative
          w-[785px]
          max-w-full
          h-[440px]
          bg-[#1c1c1e]
          overflow-hidden
          shrink-0
        "
      >

        {/* LAYER 0: LEFT PANEL BACKGROUND */}
        <div
          className="
            absolute
            left-0
            top-0
            h-full
            w-[262px]
            rounded-tr-[200px]
            rounded-br-[200px]
            bg-[#262628]
            z-0
          "
        />

        {/* LAYER 1 & 2: DECORATIONS */}
        {DECOR.map((d, i) => (
          <img
            key={i}
            src={d.src}
            alt=""
            draggable={false}
            className="
              pointer-events-none
              select-none
              absolute
              max-w-none
            "
            style={{
              left: d.left,
              top: d.top,
              width: d.w,
              height: "auto",
              zIndex: d.z,
            }}
          />
        ))}

        {/* LAYER 3: LEFT PANEL CONTENT */}
        <div
          className="
            absolute
            left-0
            top-0
            h-full
            w-[262px]
            flex
            flex-col
            items-center
            justify-center
            text-center
            px-8
            z-10
          "
        >
          <img
            src={logo}
            alt="Baonote"
            draggable={false}
            className="
              w-[110px]
              h-[110px]
              rounded-[22px]
              object-cover
            "
          />

          <h1 className="mt-5 text-[28px] font-semibold text-white">
            Baonote
          </h1>

          <p className="mt-6 text-[13px] leading-snug text-neutral-400">
            A creative planning workspace for developers and students.
          </p>
        </div>


        {/* FORM */}
        <form
          onSubmit={onSubmit}
          noValidate
          className="
            absolute
            left-[359px]
            top-[100px]
            w-[330px]
            z-20
          "
        >
          <h2 className="text-[20px] font-semibold text-white">
            {c.title}
          </h2>

          <p className="mt-1 text-[12px] text-neutral-400">
            {c.sub}
          </p>

          {/* INPUTS */}
          <div className="mt-7 space-y-3">

            {isRegister && (
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={onChange}
                className={inputCls}
              />
            )}

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={onChange}
              className={inputCls}
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              value={form.password}
              onChange={onChange}
              className={inputCls}
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="mt-2 text-[12px] text-red-400">
              {error}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-3
              w-full
              h-[38px]
              rounded-lg
              bg-fuchsia-500
              text-sm
              font-medium
              text-white
              hover:bg-fuchsia-400
              disabled:opacity-60
              transition-colors
            "
          >
            {loading ? "Please wait..." : c.button}
          </button>

          {/* SWITCH LOGIN / REGISTER */}
          <p className="mt-4 text-center text-[12px] text-neutral-400">
            {c.switchText}{" "}

            <button
              type="button"
              onClick={switchMode}
              className="text-fuchsia-400 hover:underline"
            >
              {c.switchLink}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}

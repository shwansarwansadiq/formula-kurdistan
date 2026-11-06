import { Mark } from "@/components/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="login">
      <div className="login-card glass-light">
        <Mark size={96} />
        <h1>داشبۆردی فۆڕمولا کەی</h1>
        <p>تەنها بۆ پەسەندکردنی هەواڵەکان.</p>
        <LoginForm />
      </div>
    </main>
  );
}

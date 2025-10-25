"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Checkbox,
  Input,
  Link,
  Spacer,
  Tooltip,
} from "@heroui/react";

const DEMO_USER = {
  email: "gestor@empresa.com",
  password: "seguranca123",
  name: "Gestor de Segurança",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
  const persisted = localStorage.getItem("pwa-auth");
      if (persisted) {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error("Erro ao ler sessão persistida", err);
    }
  }, [router]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Informe e-mail e senha.");
      return;
    }

    if (email === DEMO_USER.email && password === DEMO_USER.password) {
      if (remember) {
        try {
          localStorage.setItem(
            "pwa-auth",
            JSON.stringify({
              email: DEMO_USER.email,
              name: DEMO_USER.name,
            })
          );
        } catch (err) {
          console.error("Erro ao persistir sessão", err);
        }
      }
      router.replace("/dashboard");
      return;
    }

    setError("Credenciais inválidas. Use gestor@empresa.com / seguranca123.");
  };

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-6">
        <Card className="w-full max-w-xl border border-slate-200 bg-white p-10 shadow-xl">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-semibold text-slate-900">Acesse o PWA</h1>
            <p className="text-sm text-slate-600">
              Portal progressivo para gestão integrada de estoque e entrega de EPIs.
            </p>
          </div>

          <Spacer y={6} />

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              variant="bordered"
              value={email}
              type="email"
              placeholder="gestor@empresa.com"
              onValueChange={setEmail}
            />

            <Input
              label="Senha"
              variant="bordered"
              value={password}
              type="password"
              placeholder="seguranca123"
              onValueChange={setPassword}
            />

            <div className="flex items-center justify-between text-sm text-slate-500">
              <Checkbox isSelected={remember} onValueChange={setRemember}>
                Continuar conectado
              </Checkbox>
              <Tooltip content="Fluxo fictício para demonstração">
                <Link className="text-primary" href="#" isDisabled>
                  Esqueci minha senha
                </Link>
              </Tooltip>
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <Button color="primary" type="submit" size="lg">
              Entrar
            </Button>
          </form>

          <Spacer y={6} />

          <p className="text-center text-xs text-slate-500">
            Use as credenciais demo para explorar o dashboard.
          </p>
        </Card>
      </div>
    </main>
  );
}

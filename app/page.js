"use client";

import { Button, Card, Spacer } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 text-center">
        <Card className="w-full border border-slate-200 bg-white p-10 shadow-xl">
          <h1 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            PWA de Gestão Inteligente de EPIs
          </h1>
          <p className="mt-6 text-base text-slate-600 sm:text-lg">
            Centralize a gestão de estoque, entregas e conformidade de EPIs em uma
            experiência progressiva que funciona mesmo sem conexão.
          </p>
          <Spacer y={6} />
          <Button
            color="primary"
            className="w-full sm:w-auto"
            size="lg"
            onPress={() => router.push("/login")}
          >
            Acessar painel seguro
          </Button>
        </Card>
      </section>
    </main>
  );
}

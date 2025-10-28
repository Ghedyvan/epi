"use client";

import { useEffect } from "react";
import { Button, Card, CardBody } from "@heroui/react";

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log do erro para debug
    console.error("Erro capturado pelo Error Boundary:", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-4">
      <Card className="max-w-md border border-slate-200 bg-white shadow-lg">
        <CardBody className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">
            Algo deu errado!
          </h2>
          <p className="text-sm text-slate-600">
            {error?.message || "Ocorreu um erro inesperado ao carregar esta página."}
          </p>
          <Button
            color="primary"
            onPress={() => reset()}
          >
            Tentar novamente
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

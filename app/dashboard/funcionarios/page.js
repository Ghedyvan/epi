"use client";

import { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Textarea,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useData, useAutoSync } from "../../../hooks/useData";
import { STORES } from "../../../lib/db/indexedDB";

export default function FuncionariosPage() {
  // Usar hook useData para operações offline-first
  const { data: funcionarios, loading, error, upsert, remove } = useData(STORES.FUNCIONARIOS);
  const { isOnline } = useAutoSync(true);
  
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalMode, setModalMode] = useState("create");
  const [selectedFuncionario, setSelectedFuncionario] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    dataAdmissao: "",
    cargo: "",
    departamento: "",
    examePeriodico: "",
    proximoExame: "",
    observacoes: "",
  });

  // Abrir modal para criar
  const handleCreate = () => {
    setModalMode("create");
    setSelectedFuncionario(null);
    setFormData({
      nome: "",
      dataAdmissao: "",
      cargo: "",
      departamento: "",
      examePeriodico: "",
      proximoExame: "",
      observacoes: "",
    });
    onOpen();
  };

  // Abrir modal para editar
  const handleEdit = (funcionario) => {
    setModalMode("edit");
    setSelectedFuncionario(funcionario);
    setFormData({
      nome: funcionario.nome || "",
      dataAdmissao: funcionario.dataAdmissao || "",
      cargo: funcionario.cargo || "",
      departamento: funcionario.departamento || "",
      examePeriodico: funcionario.examePeriodico || "",
      proximoExame: funcionario.proximoExame || "",
      observacoes: funcionario.observacoes || "",
    });
    onOpen();
  };

  // Salvar (criar ou editar)
  const handleSave = async () => {
    try {
      // Validações básicas
      if (!formData.nome || !formData.cargo || !formData.departamento) {
        alert("Preencha os campos obrigatórios: Nome, Cargo e Departamento");
        return;
      }

      setSaving(true);
      console.log("Salvando funcionário:", formData);

      // Preparar dados para salvar
      const dataToSave = {
        ...formData,
        id: modalMode === "create" ? `col-${Date.now()}` : selectedFuncionario.id,
      };

      console.log("Dados preparados:", dataToSave);

      // Usar hook useData para salvar (funciona offline)
      const result = await upsert(dataToSave);
      console.log("Resultado do upsert:", result);

      // Fechar modal - a lista é atualizada automaticamente pelo hook
      onClose();
    } catch (err) {
      console.error("Erro ao salvar funcionário:", err);
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Deletar
  const handleDelete = async (funcionario) => {
    if (!confirm(`Tem certeza que deseja excluir ${funcionario.nome}?`)) {
      return;
    }

    try {
      // Usar hook useData para deletar (funciona offline)
      await remove(funcionario.id);
    } catch (err) {
      console.error("Erro ao deletar funcionário:", err);
      alert(`Erro ao deletar: ${err.message}`);
    }
  };

  // Update form field
  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardBody className="flex items-center justify-center p-12">
          <Spinner size="lg" label="Carregando funcionários..." />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Controle de funcionários</h2>
            <p className="text-sm text-slate-600">
              Base de dados com informações ocupacionais e exames periódicos exigidos pela NR-07.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Indicador de status online/offline */}
            <Chip
              color={isOnline ? "success" : "warning"}
              variant="flat"
              size="sm"
              startContent={
                <Icon 
                  icon={isOnline ? "solar:wifi-bold" : "solar:wifi-off-bold"} 
                  width={16} 
                />
              }
            >
              {isOnline ? "Online" : "Offline"}
            </Chip>
            
            <Chip>{funcionarios.length} colaboradores</Chip>
            <Button
              color="primary"
              startContent={<Icon icon="solar:user-plus-bold" width={20} />}
              onPress={handleCreate}
            >
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <Divider className="border-slate-200" />

        {error && (
          <CardBody>
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              <strong>Erro:</strong> {error}
            </div>
          </CardBody>
        )}

        <Table removeWrapper className="text-sm overflow-x-auto">
          <TableHeader>
            <TableColumn>NOME</TableColumn>
            <TableColumn>DATA DE ADMISSÃO</TableColumn>
            <TableColumn>CARGO</TableColumn>
            <TableColumn>DEPARTAMENTO</TableColumn>
            <TableColumn>ÚLTIMO EXAME</TableColumn>
            <TableColumn>PRÓXIMO EXAME</TableColumn>
            <TableColumn>OBSERVAÇÕES</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum colaborador cadastrado">
            {funcionarios.map((funcionario) => (
              <TableRow key={funcionario.id}>
                <TableCell className="font-medium text-slate-900">
                  {funcionario.nome}
                </TableCell>
                <TableCell>{funcionario.dataAdmissao || "—"}</TableCell>
                <TableCell>{funcionario.cargo}</TableCell>
                <TableCell>{funcionario.departamento}</TableCell>
                <TableCell>{funcionario.examePeriodico || "—"}</TableCell>
                <TableCell>{funcionario.proximoExame || "—"}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {funcionario.observacoes || "—"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleEdit(funcionario)}
                    >
                      <Icon icon="solar:pen-bold" width={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleDelete(funcionario)}
                    >
                      <Icon icon="solar:trash-bin-trash-bold" width={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal de Criar/Editar */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {modalMode === "create" ? "Adicionar Funcionário" : "Editar Funcionário"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nome completo"
                    placeholder="Ex: João Silva"
                    value={formData.nome}
                    onValueChange={(value) => updateField("nome", value)}
                    isRequired
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="date"
                      label="Data de admissão"
                      placeholder="DD/MM/AAAA"
                      value={formData.dataAdmissao}
                      onValueChange={(value) => updateField("dataAdmissao", value)}
                    />

                    <Input
                      label="Cargo"
                      placeholder="Ex: Supervisor de Campo"
                      value={formData.cargo}
                      onValueChange={(value) => updateField("cargo", value)}
                      isRequired
                    />
                  </div>

                  <Input
                    label="Departamento"
                    placeholder="Ex: Operações"
                    value={formData.departamento}
                    onValueChange={(value) => updateField("departamento", value)}
                    isRequired
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                    type="date"
                      label="Último exame periódico"
                      placeholder="DD/MM/AAAA"
                      value={formData.examePeriodico}
                      onValueChange={(value) => updateField("examePeriodico", value)}
                    />

                    <Input
                    type="date"
                      label="Próximo exame"
                      placeholder="DD/MM/AAAA"
                      value={formData.proximoExame}
                      onValueChange={(value) => updateField("proximoExame", value)}
                    />
                  </div>

                  <Textarea
                    label="Observações"
                    placeholder="Notas adicionais sobre o funcionário"
                    value={formData.observacoes}
                    onValueChange={(value) => updateField("observacoes", value)}
                    minRows={3}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancelar
                </Button>
                <Button
                  color="primary"
                  onPress={handleSave}
                  isLoading={saving}
                >
                  {modalMode === "create" ? "Adicionar" : "Salvar"}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

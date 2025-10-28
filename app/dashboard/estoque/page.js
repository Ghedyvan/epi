"use client";

import { useState, useMemo } from "react";
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
import SafeIcon from "../../../components/SafeIcon";
import { useData, useAutoSync } from "../../../hooks/useData";
import { STORES } from "../../../lib/db/indexedDB";

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  });
};

export default function EstoquePage() {
  // Usar hook useData para operações offline-first
  const { data: estoque, loading, error, upsert, remove } = useData(STORES.ESTOQUE);
  const { isOnline } = useAutoSync(true);
  
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const { isOpen, onOpen, onClose, onOpenChange } = useDisclosure();
  const [modalMode, setModalMode] = useState("create");
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    nome: "",
    fabricante: "",
    quantidadeRecebida: "",
    estoqueAtual: "",
    custoUnitario: "",
  });

  // Calcular total automaticamente
  const total = useMemo(() => {
    const quantidade = Number(formData.quantidadeRecebida) || 0;
    const custo = Number(formData.custoUnitario) || 0;
    return quantidade * custo;
  }, [formData.quantidadeRecebida, formData.custoUnitario]);

  // Abrir modal para criar
  const handleCreate = () => {
    setModalMode("create");
    setSelectedItem(null);
    setFormData({
      nome: "",
      fabricante: "",
      quantidadeRecebida: "",
      estoqueAtual: "",
      custoUnitario: "",
    });
    onOpen();
  };

  // Abrir modal para editar
  const handleEdit = (item) => {
    setModalMode("edit");
    setSelectedItem(item);
    setFormData({
      nome: item.nome || "",
      fabricante: item.fabricante || "",
      quantidadeRecebida: String(item.quantidadeRecebida || ""),
      estoqueAtual: String(item.estoqueAtual || ""),
      custoUnitario: String(item.custoUnitario || ""),
    });
    onOpen();
  };

  // Salvar (criar ou editar)
  const handleSave = async () => {
    try {
      // Validações básicas
      if (!formData.nome || !formData.fabricante || !formData.quantidadeRecebida || !formData.custoUnitario) {
        alert("Preencha os campos obrigatórios: Nome, Fabricante, Quantidade e Custo Unitário");
        return;
      }

      setSaving(true);

      // Preparar dados para salvar
      const dataToSave = {
        nome: formData.nome,
        fabricante: formData.fabricante,
        quantidadeRecebida: Number(formData.quantidadeRecebida),
        estoqueAtual: Number(formData.estoqueAtual) || Number(formData.quantidadeRecebida),
        custoUnitario: Number(formData.custoUnitario),
        total: total,
        id: modalMode === "create" ? `EST-${Date.now()}` : selectedItem.id,
      };

      // Usar hook useData para salvar (funciona offline)
      await upsert(dataToSave);

      // Fechar modal - a lista é atualizada automaticamente pelo hook
      onClose();
    } catch (err) {
      console.error("Erro ao salvar item:", err);
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // Deletar
  const handleDelete = async (item) => {
    if (!confirm(`Tem certeza que deseja excluir ${item.nome}?`)) {
      return;
    }

    try {
      await remove(item.id);
    } catch (err) {
      console.error("Erro ao deletar item:", err);
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
          <Spinner size="lg" label="Carregando estoque..." />
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Controle de estoque</h2>
            <p className="text-sm text-slate-600">
              Registro financeiro das entradas de EPIs, com rastreabilidade por fabricante e documento fiscal.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Indicador de status online/offline */}
            <Chip
              color={isOnline ? "success" : "warning"}
              variant="flat"
              size="sm"
              startContent={
                <SafeIcon 
                  icon={isOnline ? "solar:wifi-bold" : "solar:wifi-off-bold"} 
                  width={16} 
                />
              }
            >
              {isOnline ? "Online" : "Offline"}
            </Chip>
            
            <Chip>{estoque.length} itens</Chip>
            <Button
              color="primary"
              startContent={<SafeIcon icon="solar:box-minimalistic-bold" width={20} />}
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

        <Table removeWrapper className="text-sm">
          <TableHeader>
            <TableColumn>EQUIPAMENTO</TableColumn>
            <TableColumn>FABRICANTE</TableColumn>
            <TableColumn className="text-right">QTD. RECEBIDA</TableColumn>
            <TableColumn className="text-right">ESTOQUE ATUAL</TableColumn>
            <TableColumn className="text-right">CUSTO UNITÁRIO</TableColumn>
            <TableColumn className="text-right">TOTAL</TableColumn>
            <TableColumn>AÇÕES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="Nenhum item cadastrado">
            {estoque.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-slate-900">
                  {item.nome}
                </TableCell>
                <TableCell>{item.fabricante}</TableCell>
                <TableCell className="text-right">{item.quantidadeRecebida} un.</TableCell>
                <TableCell className="text-right">{item.estoqueAtual} un.</TableCell>
                <TableCell className="text-right">{formatCurrency(item.custoUnitario)}</TableCell>
                <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="primary"
                      onPress={() => handleEdit(item)}
                    >
                      <SafeIcon icon="solar:pen-bold" width={16} />
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="flat"
                      color="danger"
                      onPress={() => handleDelete(item)}
                    >
                      <SafeIcon icon="solar:trash-bin-trash-bold" width={16} />
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
                {modalMode === "create" ? "Adicionar Item ao Estoque" : "Editar Item do Estoque"}
              </ModalHeader>
              <ModalBody>
                <div className="flex flex-col gap-4">
                  <Input
                    label="Nome do equipamento"
                    placeholder="Ex: Capacete classe B"
                    value={formData.nome}
                    onValueChange={(value) => updateField("nome", value)}
                    isRequired
                  />

                  <Input
                    label="Fabricante"
                    placeholder="Ex: ProtegeMax"
                    value={formData.fabricante}
                    onValueChange={(value) => updateField("fabricante", value)}
                    isRequired
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="number"
                      label="Quantidade recebida"
                      placeholder="0"
                      value={formData.quantidadeRecebida}
                      onValueChange={(value) => updateField("quantidadeRecebida", value)}
                      isRequired
                      endContent={<span className="text-xs text-slate-500">un.</span>}
                    />

                    <Input
                      type="number"
                      label="Estoque atual"
                      placeholder="0"
                      value={formData.estoqueAtual}
                      onValueChange={(value) => updateField("estoqueAtual", value)}
                      endContent={<span className="text-xs text-slate-500">un.</span>}
                      description="Deixe vazio para usar a quantidade recebida"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      type="number"
                      label="Custo unitário"
                      placeholder="0.00"
                      value={formData.custoUnitario}
                      onValueChange={(value) => updateField("custoUnitario", value)}
                      isRequired
                      startContent={<span className="text-xs text-slate-500">R$</span>}
                    />

                    <Input
                      type="number"
                      label="Total"
                      value={String(total.toFixed(2))}
                      isReadOnly
                      startContent={<span className="text-xs text-slate-500">R$</span>}
                      description="Calculado automaticamente"
                      classNames={{
                        input: "bg-slate-50",
                      }}
                    />
                  </div>
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

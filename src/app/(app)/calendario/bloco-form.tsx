"use client";

import { useActionState, useId, useState } from "react";
import { toast } from "sonner";
import { ErroFormulario } from "@/components/erro-formulario";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { diaIso, formatarMinuto, localSP, NOMES_DIA_CURTO } from "@/lib/calendario";
import { enviarSemResetar } from "@/lib/form";
import { criarBloco, editarBloco, type Resultado } from "./actions";
import type { BlocoCal, HabilidadeCal } from "./dados";

export type Rascunho = { data: string; ini: number; fim: number };

/** Criar (a partir de um horário) ou editar (uma ocorrência) um bloco planejado. */
export function BlocoForm({
  aberto,
  aoFechar,
  rascunho,
  bloco,
  habilidades,
}: {
  aberto: boolean;
  aoFechar: () => void;
  rascunho: Rascunho | null;
  bloco: BlocoCal | null;
  habilidades: HabilidadeCal[];
}) {
  return (
    <Dialog open={aberto} onOpenChange={(a) => !a && aoFechar()}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
        {aberto && (
          <Conteudo
            key={bloco?.chave ?? `${rascunho?.data}-${rascunho?.ini}`}
            rascunho={rascunho}
            bloco={bloco}
            habilidades={habilidades}
            aoFechar={aoFechar}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Conteudo({
  rascunho,
  bloco,
  habilidades,
  aoFechar,
}: {
  rascunho: Rascunho | null;
  bloco: BlocoCal | null;
  habilidades: HabilidadeCal[];
  aoFechar: () => void;
}) {
  const id = useId();
  // Deu certo: fecha e avisa (fora da renderização, dentro da própria ação).
  const [estado, acao, pendente] = useActionState<Resultado, FormData>(async (anterior, dados) => {
    const r = await (bloco ? editarBloco : criarBloco)(anterior, dados);
    if (r?.ok) {
      toast.success(bloco ? "Bloco atualizado" : "Bloco criado");
      aoFechar();
    }
    return r;
  }, null);

  const ini = bloco ? localSP(bloco.inicio) : null;
  const fim = bloco ? localSP(bloco.fim) : null;
  const data = bloco?.data ?? rascunho?.data ?? "";
  const horaIni = formatarMinuto(ini?.minuto ?? rascunho?.ini ?? 9 * 60);
  const minutoFim = fim ? (fim.dia > ini!.dia ? 1440 : fim.minuto) : (rascunho?.fim ?? 10 * 60);
  const horaFim = formatarMinuto(minutoFim >= 1440 ? 0 : minutoFim);

  const [repetir, setRepetir] = useState(Boolean(bloco?.serie));
  const diasIniciais = bloco?.repeteDias ?? (data ? [diaIso(data)] : []);

  // Habilidades ativas + a do bloco (mesmo se arquivada depois).
  const opcoes = habilidades.filter((h) => h.ativa || h.id === bloco?.skillId);
  const areas = [...new Set(opcoes.map((h) => h.area))];

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>{bloco ? "Editar bloco" : "Novo bloco"}</DialogTitle>
      </DialogHeader>
      {bloco && (
        <>
          <input type="hidden" name="id" value={bloco.blocoId} />
          <input type="hidden" name="ocorrencia" value={bloco.data} />
        </>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-skill`}>Habilidade</Label>
        <NativeSelect id={`${id}-skill`} name="skill_id" defaultValue={bloco?.skillId ?? ""} className="w-full" required>
          <NativeSelectOption value="" disabled>
            Escolha a habilidade…
          </NativeSelectOption>
          {areas.map((area) => (
            <NativeSelectOptGroup key={area} label={area}>
              {opcoes
                .filter((h) => h.area === area)
                .map((h) => (
                  <NativeSelectOption key={h.id} value={h.id}>
                    {h.nome}
                  </NativeSelectOption>
                ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_7rem_7rem]">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <Label htmlFor={`${id}-data`}>Data</Label>
          <Input id={`${id}-data`} name="data" type="date" defaultValue={data} required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-ini`}>Início</Label>
          <Input id={`${id}-ini`} name="hora_inicio" type="time" defaultValue={horaIni} className="numero" required />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor={`${id}-fim`}>Fim</Label>
          <Input id={`${id}-fim`} name="hora_fim" type="time" defaultValue={horaFim} className="numero" required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-obs`}>
          Foco ou observação <span className="text-on-surface-variant">(opcional)</span>
        </Label>
        <Input
          id={`${id}-obs`}
          name="observacao"
          defaultValue={bloco?.observacao ?? ""}
          maxLength={200}
          placeholder="Vira o foco ao iniciar o timer"
        />
      </div>

      <div className="flex flex-col gap-4 rounded-lg bg-surface-container px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={`${id}-repetir`} className="min-w-0 flex-1 cursor-pointer">
            <span className="block type-body-large text-on-surface">Repetir toda semana</span>
            <span className="block type-body-small text-on-surface-variant">Ex.: academia ter, qua, sex e dom</span>
          </label>
          <Switch id={`${id}-repetir`} name="repetir" value="on" checked={repetir} onCheckedChange={setRepetir} />
        </div>
        {repetir && (
          <>
            <fieldset>
              <legend className="sr-only">Dias da semana</legend>
              <div className="flex flex-wrap gap-2">
                {NOMES_DIA_CURTO.map((nome, i) => (
                  <label
                    key={nome}
                    className="opcao flex size-11 items-center justify-center rounded-full type-label-large has-checked:bg-primary has-checked:text-on-primary"
                  >
                    <input type="checkbox" name="dias" value={i + 1} defaultChecked={diasIniciais.includes(i + 1)} className="sr-only" />
                    {nome}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${id}-ate`}>
                Até <span className="text-on-surface-variant">(opcional)</span>
              </Label>
              <Input id={`${id}-ate`} name="repete_ate" type="date" defaultValue={bloco?.repeteAte ?? ""} className="w-48" />
            </div>
          </>
        )}
      </div>

      {bloco?.serie && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 type-title-small text-on-surface">Aplicar a</legend>
          <div className="flex" role="radiogroup">
            <label className="segmento">
              <input type="radio" name="escopo" value="este" defaultChecked className="sr-only" />
              Só este
            </label>
            <label className="segmento">
              <input type="radio" name="escopo" value="seguintes" className="sr-only" />
              Este e os seguintes
            </label>
          </div>
        </fieldset>
      )}

      {estado?.erro && <ErroFormulario>{estado.erro}</ErroFormulario>}

      <DialogFooter>
        <Button type="button" variant="text" onClick={aoFechar}>
          Cancelar
        </Button>
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : bloco ? "Salvar" : "Criar bloco"}
        </Button>
      </DialogFooter>
    </form>
  );
}

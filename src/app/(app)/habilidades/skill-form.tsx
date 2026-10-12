"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, PlusIcon, XIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ESCALAS } from "@/lib/escalas";
import { enviarSemResetar } from "@/lib/form";
import { type Habilidade, TIPOS_META_TEMPO, type TipoMetaTempo } from "@/lib/tipos";
import { type NivelForm, salvarHabilidade } from "./actions";

type Props = {
  habilidade?: Habilidade;
  areas: { id: string; nome: string }[];
  areaInicial?: string;
  niveisIniciais?: NivelForm[];
  metasIniciais?: { semana?: number; mes?: number };
  cancelarHref: string;
};

export function SkillForm({
  habilidade,
  areas,
  areaInicial,
  niveisIniciais = [],
  metasIniciais = {},
  cancelarHref,
}: Props) {
  const [estado, acao, pendente] = useActionState(salvarHabilidade, null);
  const [tipo, setTipo] = useState<TipoMetaTempo>(
    (habilidade?.tipo_meta_tempo as TipoMetaTempo) ?? "niveis",
  );
  const [niveis, setNiveis] = useState<NivelForm[]>(niveisIniciais);
  const contador = useRef(0);
  const novoId = () => `novo-${++contador.current}`;

  function alterar(i: number, campo: "nome" | "horas" | "fonte", valor: string) {
    setNiveis((lista) =>
      lista.map((n, j) => (j === i ? { ...n, [campo]: campo === "horas" ? Number(valor.replace(",", ".")) : valor } : n)),
    );
  }

  function moverNivel(i: number, delta: -1 | 1) {
    setNiveis((lista) => {
      const nova = [...lista];
      [nova[i], nova[i + delta]] = [nova[i + delta], nova[i]];
      return nova;
    });
  }

  function aplicarEscala(id: string) {
    const escala = ESCALAS.find((e) => e.id === id);
    if (!escala) return;
    if (niveis.length && !window.confirm(`Substituir os níveis atuais pela escala ${escala.nome}?`)) return;
    setNiveis(escala.niveis.map((n) => ({ id: novoId(), ...n })));
  }

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-2xl flex-col gap-6">
      {habilidade && <input type="hidden" name="id" value={habilidade.id} />}
      <input type="hidden" name="niveis" value={JSON.stringify(niveis)} />

      <div className="grid gap-4 sm:grid-cols-[1fr_14rem]">
        <div className="flex flex-col gap-2">
          <Label htmlFor="nome">Nome</Label>
          <Input
            id="nome"
            name="nome"
            defaultValue={habilidade?.nome}
            required
            maxLength={80}
            autoFocus={!habilidade}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="area_id">Área</Label>
          <NativeSelect
            id="area_id"
            name="area_id"
            defaultValue={habilidade?.area_id ?? areaInicial ?? areas[0]?.id}
            className="w-full"
            required
          >
            {areas.map((a) => (
              <NativeSelectOption key={a.id} value={a.id}>
                {a.nome}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Textarea
          id="descricao"
          name="descricao"
          defaultValue={habilidade?.descricao ?? ""}
          rows={2}
          maxLength={300}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Meta de tempo</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {TIPOS_META_TEMPO.map((t) => (
            <label
              key={t.valor}
              className="cursor-pointer rounded-lg border p-3 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring"
            >
              <input
                type="radio"
                name="tipo_meta_tempo"
                value={t.valor}
                checked={tipo === t.valor}
                onChange={() => setTipo(t.valor)}
                className="sr-only"
              />
              <span className="block text-sm font-medium">{t.nome}</span>
              <span className="block text-xs text-muted-foreground">{t.descricao}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {tipo === "niveis" && (
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-medium">Níveis</h2>
              <p className="text-xs text-muted-foreground">
                Horas efetivas acumuladas para chegar a cada nível, do menor para o maior.
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {ESCALAS.map((e) => (
                <Button key={e.id} type="button" variant="outline" size="xs" onClick={() => aplicarEscala(e.id)}>
                  Escala {e.nome}
                </Button>
              ))}
            </div>
          </div>

          {niveis.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum nível. Use uma escala pronta ou adicione manualmente.
            </p>
          )}

          <ol className="flex flex-col gap-3">
            {niveis.map((n, i) => (
              <li key={n.id} className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">{i + 1}</span>
                  <Input
                    aria-label={`Nome do nível ${i + 1}`}
                    placeholder="Nome (ex.: B1)"
                    value={n.nome}
                    onChange={(e) => alterar(i, "nome", e.target.value)}
                    className="min-w-0 flex-1"
                    required
                  />
                  <div className="relative w-24 shrink-0">
                    <Input
                      aria-label={`Horas do nível ${i + 1}`}
                      type="number"
                      inputMode="decimal"
                      min={0.5}
                      step={0.5}
                      value={Number.isNaN(n.horas) ? "" : n.horas}
                      onChange={(e) => alterar(i, "horas", e.target.value)}
                      className="pr-7"
                      required
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                      h
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-7">
                  <Input
                    aria-label={`Fonte de referência do nível ${i + 1}`}
                    placeholder="Fonte de referência (opcional)"
                    value={n.fonte}
                    onChange={(e) => alterar(i, "fonte", e.target.value)}
                    className="h-7 min-w-0 flex-1 text-xs"
                  />
                  <div className="flex shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Subir nível"
                      disabled={i === 0}
                      onClick={() => moverNivel(i, -1)}
                    >
                      <ChevronUpIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Descer nível"
                      disabled={i === niveis.length - 1}
                      onClick={() => moverNivel(i, 1)}
                    >
                      <ChevronDownIcon />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Remover nível"
                      onClick={() => setNiveis((lista) => lista.filter((_, j) => j !== i))}
                    >
                      <XIcon />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => setNiveis((lista) => [...lista, { id: novoId(), nome: "", horas: NaN, fonte: "" }])}
          >
            <PlusIcon />
            Adicionar nível
          </Button>
        </section>
      )}

      {tipo === "periodica" && (
        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <div>
            <h2 className="text-sm font-medium">Meta periódica</h2>
            <p className="text-xs text-muted-foreground">
              Horas efetivas por período. Preencha um ou os dois; deixe vazio para não ter meta naquele período.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:max-w-sm">
            <div className="flex flex-col gap-2">
              <Label htmlFor="meta_semana">Horas por semana</Label>
              <Input
                id="meta_semana"
                name="meta_semana"
                type="number"
                inputMode="decimal"
                min={0.5}
                step={0.5}
                defaultValue={metasIniciais.semana}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="meta_mes">Horas por mês</Label>
              <Input
                id="meta_mes"
                name="meta_mes"
                type="number"
                inputMode="decimal"
                min={0.5}
                step={0.5}
                defaultValue={metasIniciais.mes}
              />
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="horas_iniciais">Horas antes do Echo</Label>
          <Input
            id="horas_iniciais"
            name="horas_iniciais"
            type="number"
            inputMode="decimal"
            min={0}
            step={0.5}
            defaultValue={habilidade?.horas_iniciais || ""}
            placeholder="0"
          />
          <p className="text-xs text-muted-foreground">
            Ponto de partida: horas que você já praticou antes de começar a registrar aqui.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="nivel_atual_autoavaliado">Autoavaliação atual (1–10)</Label>
          <NativeSelect
            id="nivel_atual_autoavaliado"
            name="nivel_atual_autoavaliado"
            defaultValue={habilidade?.nivel_atual_autoavaliado?.toString() ?? ""}
            className="w-full"
          >
            <NativeSelectOption value="">Sem avaliação</NativeSelectOption>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <NativeSelectOption key={n} value={n}>
                {n}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
      </section>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="destaque_dashboard"
          defaultChecked={habilidade?.destaque_dashboard ?? false}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          Destacar no dashboard
          <span className="block text-xs text-muted-foreground">
            Mostra as horas da semana desta habilidade no dashboard (ex.: Padel).
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          name="permite_pratica_passiva"
          defaultChecked={habilidade?.permite_pratica_passiva ?? false}
          className="mt-0.5 size-4 accent-primary"
        />
        <span>
          Permite prática passiva
          <span className="block text-xs text-muted-foreground">
            Mostra a opção ativa/passiva ao registrar (ex.: ouvir podcast em idiomas). Sessões
            passivas contam com o fator definido em Configurações.
          </span>
        </span>
      </label>

      {estado?.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pendente}>
          {pendente ? "Salvando…" : habilidade ? "Salvar" : "Criar habilidade"}
        </Button>
        <Link href={cancelarHref} className={buttonVariants({ variant: "ghost" })}>
          Cancelar
        </Link>
      </div>
    </form>
  );
}

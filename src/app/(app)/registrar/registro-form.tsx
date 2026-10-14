"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { CheckIcon, ChevronDownIcon, CircleAlertIcon, CornerDownRightIcon, TimerIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Horas } from "@/components/horas";
import { Button, buttonVariants } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { formatarDuracao, paraInputLocal } from "@/lib/datas";
import { enviarSemResetar } from "@/lib/form";
import { type FatorQualidade, horasEfetivas, sugerirNota, type TipoPratica } from "@/lib/pratica";
import { corArea } from "@/lib/cores-area";
import { cn } from "@/lib/utils";
import { descartarTimer, iniciarTimer } from "../timer/actions";
import { salvarSessao } from "./actions";

type HabilidadeOpcao = { id: string; nome: string; area: string; cor: string; permitePassiva: boolean };

type DadosTimer = {
  id: string;
  skillId: string;
  inicio: string;
  fim: string;
  minutos: number;
  foco: string;
  distracoes: number;
};

type Props = {
  habilidades: HabilidadeOpcao[];
  maisUsadas: string[];
  proximosPassos: Record<string, string>;
  fatores: FatorQualidade[];
  fatorPassivo: number;
  timer: DadosTimer | null;
  timerAtivo: boolean;
  skillInicial?: string;
};

const DURACOES_RAPIDAS = [15, 25, 30, 45, 60, 90];

/** Remonta o formulário (estado limpo) ao clicar em "Registrar outra". */
export function RegistroCliente(props: Props) {
  const [chave, setChave] = useState(0);
  const router = useRouter();
  return (
    <RegistroForm
      key={chave}
      {...props}
      aoRegistrarOutra={() => {
        setChave((c) => c + 1);
        router.replace("/registrar");
      }}
    />
  );
}

function RegistroForm({
  habilidades,
  maisUsadas,
  proximosPassos,
  fatores,
  fatorPassivo,
  timer,
  timerAtivo,
  skillInicial,
  aoRegistrarOutra,
}: Props & { aoRegistrarOutra: () => void }) {
  const [estado, acao, salvando] = useActionState(salvarSessao, null);
  const [iniciando, startIniciar] = useTransition();

  const skillPadrao = timer?.skillId ?? skillInicial ?? maisUsadas[0] ?? "";
  const [skillId, setSkillId] = useState(skillPadrao);
  const [foco, setFoco] = useState(timer?.foco || proximosPassos[skillPadrao] || "");
  const [modo, setModo] = useState<"duracao" | "intervalo">("duracao");
  const [duracao, setDuracao] = useState(timer ? String(timer.minutos) : "");
  const [intervalo, setIntervalo] = useState({ inicio: "", fim: "" });
  const notaSugerida = timer ? sugerirNota(timer.distracoes, timer.minutos) : null;
  const [nota, setNota] = useState<number | null>(notaSugerida);
  const [tipo, setTipo] = useState<TipoPratica>("ativa");

  const habilidade = habilidades.find((h) => h.id === skillId);
  const sugestaoFoco = timer ? "" : (proximosPassos[skillId] ?? "");

  function escolherHabilidade(id: string) {
    // Troca a sugestão de foco, a não ser que você já tenha escrito outra coisa.
    if (!timer && (foco === "" || foco === (proximosPassos[skillId] ?? ""))) setFoco(proximosPassos[id] ?? "");
    setSkillId(id);
    if (!habilidades.find((h) => h.id === id)?.permitePassiva) setTipo("ativa");
  }

  function mudarModo(novo: "duracao" | "intervalo") {
    if (novo === "intervalo" && !intervalo.fim) {
      const fim = new Date();
      const minutos = Number(duracao) > 0 ? Number(duracao) : 30;
      setIntervalo({
        inicio: paraInputLocal(new Date(fim.getTime() - minutos * 60_000)),
        fim: paraInputLocal(fim),
      });
    }
    setModo(novo);
  }

  const minutos =
    modo === "duracao"
      ? Number(duracao.replace(",", "."))
      : (new Date(intervalo.fim).getTime() - new Date(intervalo.inicio).getTime()) / 60_000;
  const previa =
    minutos > 0 && nota ? horasEfetivas(minutos, nota, fatores, tipo, fatorPassivo) : null;

  if (estado?.ok) {
    return (
      <div className="flex max-w-xl flex-col items-start gap-5 rounded-lg bg-surface-container-low p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-full bg-concluido text-surface">
            <CheckIcon className="size-5" strokeWidth={2.5} aria-hidden />
          </span>
          <h2 className="type-title-large text-on-surface">Sessão salva</h2>
        </div>
        <p className="type-body-large text-on-surface-variant">
          {estado.habilidade} · {formatarDuracao(estado.minutos)} ·{" "}
          <span className="text-on-surface">
            <Horas valor={estado.horasEfetivas} /> efetivas
          </span>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={aoRegistrarOutra}>Registrar outra</Button>
          <Link href={`/habilidades/${estado.skillId}`} className={buttonVariants({ variant: "outline" })}>
            Ver {estado.habilidade}
          </Link>
          <Link href="/" className={buttonVariants({ variant: "text" })}>
            Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-8">
      <input type="hidden" name="skill_id" value={skillId} />
      <input type="hidden" name="modo" value={modo} />
      <input type="hidden" name="tipo_pratica" value={tipo} />
      {timer && (
        <>
          <input type="hidden" name="timer_id" value={timer.id} />
          <input type="hidden" name="timer_inicio" value={timer.inicio} />
          <input type="hidden" name="timer_fim" value={timer.fim} />
          <input type="hidden" name="distracoes" value={timer.distracoes} />
        </>
      )}

      {/* Habilidade */}
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 type-title-small text-on-surface">Habilidade</legend>
        {maisUsadas.length > 0 && !timer && (
          <div className="flex flex-wrap gap-2">
            {maisUsadas.map((id) => {
              const h = habilidades.find((x) => x.id === id);
              if (!h) return null;
              return (
                <Chip key={id} selecionado={skillId === id} onClick={() => escolherHabilidade(id)}>
                  {skillId !== id && (
                    <span className="size-2 rounded-full" style={{ backgroundColor: corArea(h.cor) }} aria-hidden />
                  )}
                  {h.nome}
                </Chip>
              );
            })}
          </div>
        )}
        <NativeSelect
          aria-label="Habilidade"
          value={skillId}
          onChange={(e) => escolherHabilidade(e.target.value)}
          className="w-full"
          disabled={Boolean(timer)}
          required
        >
          <NativeSelectOption value="" disabled>
            {maisUsadas.length ? "Outra habilidade…" : "Escolha a habilidade…"}
          </NativeSelectOption>
          {[...new Set(habilidades.map((h) => h.area))].map((area) => (
            <NativeSelectOptGroup key={area} label={area}>
              {habilidades
                .filter((h) => h.area === area)
                .map((h) => (
                  <NativeSelectOption key={h.id} value={h.id}>
                    {h.nome}
                  </NativeSelectOption>
                ))}
            </NativeSelectOptGroup>
          ))}
        </NativeSelect>
      </fieldset>

      {/* Foco */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="foco_especifico">O que você treinou</Label>
        <Input
          id="foco_especifico"
          name="foco_especifico"
          value={foco}
          onChange={(e) => setFoco(e.target.value)}
          placeholder="Ex.: listening com podcast nativo, sem legenda"
          maxLength={200}
        />
        {sugestaoFoco && foco === sugestaoFoco && (
          <p className="flex items-center gap-1.5 type-body-small text-on-surface-variant">
            <CornerDownRightIcon className="size-4" aria-hidden />
            Próximo passo da última sessão desta habilidade
          </p>
        )}
      </div>

      {/* Duração */}
      <fieldset className="flex flex-col gap-3">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <legend className="type-title-small text-on-surface">Duração</legend>
          {!timer && (
            <div className="flex w-full max-w-64 sm:w-64" role="group" aria-label="Como informar a duração">
              {(["duracao", "intervalo"] as const).map((m) => (
                <button key={m} type="button" onClick={() => mudarModo(m)} aria-pressed={modo === m} className="segmento">
                  {modo === m && <CheckIcon className="size-4" aria-hidden />}
                  {m === "duracao" ? "Minutos" : "Início e fim"}
                </button>
              ))}
            </div>
          )}
        </div>

        {modo === "duracao" ? (
          <>
            <div className="relative w-40">
              <Input
                aria-label="Duração em minutos"
                name="duracao"
                type="number"
                inputMode="numeric"
                min={1}
                max={1440}
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="numero pr-14"
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 type-body-large text-on-surface-variant">
                min
              </span>
            </div>
            {!timer && (
              <div className="flex flex-wrap gap-2" role="group" aria-label="Durações rápidas">
                {DURACOES_RAPIDAS.map((m) => (
                  <Chip key={m} selecionado={Number(duracao) === m} onClick={() => setDuracao(String(m))}>
                    {formatarDuracao(m)}
                  </Chip>
                ))}
              </div>
            )}
            <p className="type-body-small text-on-surface-variant">
              {timer ? "Tempo cronometrado, sem as pausas. Ajuste se precisar." : "Terminando agora."}
            </p>
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inicio">Início</Label>
              <Input
                id="inicio"
                name="inicio"
                type="datetime-local"
                value={intervalo.inicio}
                onChange={(e) => setIntervalo((v) => ({ ...v, inicio: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="fim">Fim</Label>
              <Input
                id="fim"
                name="fim"
                type="datetime-local"
                value={intervalo.fim}
                onChange={(e) => setIntervalo((v) => ({ ...v, fim: e.target.value }))}
                required
              />
            </div>
          </div>
        )}
      </fieldset>

      {/* Nota de qualidade */}
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-3 type-title-small text-on-surface">Qualidade da prática</legend>
        {timer && notaSugerida && (
          <p className="mb-1 type-body-small text-on-surface-variant">
            {timer.distracoes === 0
              ? "Nenhuma distração no timer"
              : `${timer.distracoes} ${timer.distracoes === 1 ? "distração" : "distrações"} no timer`}
            : nota {notaSugerida} sugerida. Pode mudar.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {fatores.map((f) => (
            <label key={f.nota} className="opcao flex min-h-14 items-center gap-4 px-4 py-2">
              <input
                type="radio"
                name="nota_qualidade"
                value={f.nota}
                checked={nota === f.nota}
                onChange={() => setNota(f.nota)}
                className="sr-only"
                required
              />
              <span
                className={cn(
                  "numero flex size-8 shrink-0 items-center justify-center rounded-full type-title-medium",
                  nota === f.nota ? "bg-on-secondary-container text-secondary-container" : "bg-surface-container-highest",
                )}
              >
                {f.nota}
              </span>
              <span className="min-w-0 flex-1 type-body-medium">{f.descricao}</span>
              <span className="numero shrink-0 type-body-small opacity-80">×{f.fator.toLocaleString("pt-BR")}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ativa/passiva */}
      {habilidade?.permitePassiva && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-3 type-title-small text-on-surface">Tipo de prática</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["ativa", "passiva"] as const).map((t) => (
              <label key={t} className="opcao flex flex-col gap-0.5 p-4">
                <input type="radio" name="tipo_pratica_opcao" checked={tipo === t} onChange={() => setTipo(t)} className="sr-only" />
                <span className="type-title-small">{t === "ativa" ? "Ativa" : "Passiva"}</span>
                <span className="type-body-small opacity-80">
                  {t === "ativa"
                    ? "Falar, escrever, exercícios"
                    : `Ouvir, assistir · conta ×${fatorPassivo.toLocaleString("pt-BR")}`}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Reflexão */}
      <details className="group rounded-lg bg-surface-container-low">
        <summary className="camada-estado flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 [&::-webkit-details-marker]:hidden">
          <span className="type-title-small text-on-surface">
            Reflexão <span className="font-normal text-on-surface-variant">(opcional)</span>
          </span>
          <ChevronDownIcon className="size-5 text-on-surface-variant transition-transform duration-200 group-open:rotate-180" aria-hidden />
        </summary>
        <div className="flex flex-col gap-5 px-4 pt-1 pb-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="aprendizado">O que aprendi</Label>
            <Textarea id="aprendizado" name="aprendizado" rows={2} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="erros">Erros e dificuldades</Label>
            <Textarea id="erros" name="erros" rows={2} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="proximo_passo">Próximo passo</Label>
            <Textarea id="proximo_passo" name="proximo_passo" rows={2} placeholder="Vira a sugestão de foco da próxima sessão" />
          </div>
          <label className="flex cursor-pointer items-center justify-between gap-4 type-body-large text-on-surface">
            <span>
              Tive feedback
              <span className="block type-body-small text-on-surface-variant">Professor, parceiro, correção, gravação</span>
            </span>
            <Switch name="teve_feedback" value="on" />
          </label>
        </div>
      </details>

      {estado && !estado.ok && (
        <p role="alert" className="flex items-start gap-2 rounded-md bg-error-container px-4 py-3 type-body-medium text-on-error-container">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          {estado.erro}
        </p>
      )}

      <div className="flex flex-col gap-4 border-t border-outline-variant pt-6">
        {previa !== null && (
          <p className="type-body-large text-on-surface-variant" aria-live="polite">
            {formatarDuracao(minutos)} ·{" "}
            <span className="type-title-large text-on-surface">
              <Horas valor={previa} />
            </span>{" "}
            efetivas
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" size="lg" disabled={salvando || !skillId} className="sm:flex-1">
            {salvando ? "Salvando…" : "Salvar sessão"}
          </Button>
          {!timer && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              disabled={iniciando || !skillId || timerAtivo}
              title={timerAtivo ? "Já existe um timer ativo" : undefined}
              onClick={() =>
                startIniciar(async () => {
                  const r = await iniciarTimer(skillId, foco);
                  if (r?.erro) toast.error(r.erro);
                })
              }
            >
              <TimerIcon />
              {iniciando ? "Iniciando…" : "Iniciar timer"}
            </Button>
          )}
          {timer && (
            <ConfirmButton
              acao={descartarTimer}
              confirmar="Descartar o timer sem salvar a sessão?"
              variant="text"
              size="lg"
            >
              Descartar timer
            </ConfirmButton>
          )}
        </div>
      </div>
    </form>
  );
}

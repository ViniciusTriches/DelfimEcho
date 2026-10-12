"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState, useTransition } from "react";
import { CheckCircle2Icon, CornerDownRightIcon, TimerIcon } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { formatarDuracao, paraInputLocal } from "@/lib/datas";
import { enviarSemResetar } from "@/lib/form";
import { formatarHoras } from "@/lib/formato";
import { type FatorQualidade, horasEfetivas, sugerirNota, type TipoPratica } from "@/lib/pratica";
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
      <div className="flex max-w-xl flex-col items-start gap-4 rounded-xl border p-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <CheckCircle2Icon className="size-6 text-emerald-500" aria-hidden />
          Sessão salva
        </div>
        <p className="text-muted-foreground">
          {estado.habilidade} · {formatarDuracao(estado.minutos)} ·{" "}
          <strong className="text-foreground">{formatarHoras(estado.horasEfetivas)} efetivas</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={aoRegistrarOutra}>Registrar outra</Button>
          <Link href={`/habilidades/${estado.skillId}`} className={buttonVariants({ variant: "outline" })}>
            Ver {estado.habilidade}
          </Link>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={enviarSemResetar(acao)} className="flex max-w-xl flex-col gap-6">
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
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Habilidade</legend>
        {maisUsadas.length > 0 && !timer && (
          <div className="flex flex-wrap gap-2">
            {maisUsadas.map((id) => {
              const h = habilidades.find((x) => x.id === id);
              if (!h) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => escolherHabilidade(id)}
                  aria-pressed={skillId === id}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    skillId === id ? "border-primary bg-primary/10 font-medium" : "hover:bg-muted",
                  )}
                >
                  <span className="size-2 rounded-full" style={{ backgroundColor: h.cor }} aria-hidden />
                  {h.nome}
                </button>
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
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <CornerDownRightIcon className="size-3.5" aria-hidden />
            Próximo passo da última sessão desta habilidade
          </p>
        )}
      </div>

      {/* Duração */}
      <fieldset className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <legend className="text-sm font-medium">Duração</legend>
          {!timer && (
            <div className="flex rounded-lg border p-0.5 text-xs">
              {(["duracao", "intervalo"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => mudarModo(m)}
                  aria-pressed={modo === m}
                  className={cn("rounded-md px-2.5 py-1", modo === m && "bg-muted font-medium")}
                >
                  {m === "duracao" ? "Minutos" : "Início e fim"}
                </button>
              ))}
            </div>
          )}
        </div>

        {modo === "duracao" ? (
          <>
            <div className="relative w-36">
              <Input
                aria-label="Duração em minutos"
                name="duracao"
                type="number"
                inputMode="numeric"
                min={1}
                max={1440}
                value={duracao}
                onChange={(e) => setDuracao(e.target.value)}
                className="pr-12"
                required
              />
              <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">
                min
              </span>
            </div>
            {!timer && (
              <div className="flex flex-wrap gap-2">
                {DURACOES_RAPIDAS.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    variant={Number(duracao) === m ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setDuracao(String(m))}
                  >
                    {formatarDuracao(m)}
                  </Button>
                ))}
              </div>
            )}
            {timer && (
              <p className="text-xs text-muted-foreground">
                Tempo cronometrado, sem as pausas. Ajuste se precisar.
              </p>
            )}
            {!timer && <p className="text-xs text-muted-foreground">Terminando agora.</p>}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inicio" className="text-xs">
                Início
              </Label>
              <Input
                id="inicio"
                name="inicio"
                type="datetime-local"
                value={intervalo.inicio}
                onChange={(e) => setIntervalo((v) => ({ ...v, inicio: e.target.value }))}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fim" className="text-xs">
                Fim
              </Label>
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
        <legend className="mb-2 text-sm font-medium">Qualidade da prática</legend>
        {timer && notaSugerida && (
          <p className="text-xs text-muted-foreground">
            {timer.distracoes === 0
              ? "Nenhuma distração no timer"
              : `${timer.distracoes} ${timer.distracoes === 1 ? "distração" : "distrações"} no timer`}
            : nota {notaSugerida} sugerida. Pode mudar.
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          {fatores.map((f) => (
            <label
              key={f.nota}
              className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 has-checked:border-primary has-checked:bg-primary/5 has-focus-visible:ring-2 has-focus-visible:ring-ring"
            >
              <input
                type="radio"
                name="nota_qualidade"
                value={f.nota}
                checked={nota === f.nota}
                onChange={() => setNota(f.nota)}
                className="sr-only"
                required
              />
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {f.nota}
              </span>
              <span className="min-w-0 flex-1 text-sm">{f.descricao}</span>
              <span className="shrink-0 text-xs text-muted-foreground">×{f.fator.toLocaleString("pt-BR")}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Ativa/passiva */}
      {habilidade?.permitePassiva && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Tipo de prática</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["ativa", "passiva"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipo(t)}
                aria-pressed={tipo === t}
                className={cn(
                  "rounded-lg border p-2.5 text-left text-sm",
                  tipo === t ? "border-primary bg-primary/5" : "hover:bg-muted",
                )}
              >
                <span className="block font-medium">{t === "ativa" ? "Ativa" : "Passiva"}</span>
                <span className="block text-xs text-muted-foreground">
                  {t === "ativa"
                    ? "Falar, escrever, exercícios"
                    : `Ouvir, assistir · conta ×${fatorPassivo.toLocaleString("pt-BR")}`}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {/* Reflexão */}
      <details className="group rounded-xl border">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Reflexão <span className="font-normal text-muted-foreground">(opcional)</span>
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-4">
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
            <Textarea
              id="proximo_passo"
              name="proximo_passo"
              rows={2}
              placeholder="Vira a sugestão de foco da próxima sessão"
            />
          </div>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" name="teve_feedback" className="size-4 accent-primary" />
            Tive feedback (professor, parceiro, correção, gravação)
          </label>
        </div>
      </details>

      {estado && !estado.ok && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex flex-col gap-3">
        {previa !== null && (
          <p className="text-sm text-muted-foreground">
            {formatarDuracao(minutos)} ·{" "}
            <strong className="text-foreground">{formatarHoras(previa)} efetivas</strong>
          </p>
        )}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button type="submit" size="lg" disabled={salvando || !skillId} className="h-11 sm:flex-1">
            {salvando ? "Salvando…" : "Salvar sessão"}
          </Button>
          {!timer && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11"
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
              variant="ghost"
              size="lg"
              className="h-11"
            >
              Descartar timer
            </ConfirmButton>
          )}
        </div>
      </div>
    </form>
  );
}

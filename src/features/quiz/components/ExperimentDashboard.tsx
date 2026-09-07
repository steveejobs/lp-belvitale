import { useEffect, useMemo, useState } from "react";
import {
  quizExperimentId,
  quizExperimentVariants,
  type QuizExperimentVariant,
} from "../experiment/quiz.experiment";
import {
  buildExperimentReport,
  clearExperimentObservations,
  experimentFunnel,
  readExperimentObservations,
  seedExperimentObservations,
  type ExperimentObservation,
  type VariantReport,
} from "../tracking/experiment.store";
import "../experiment-dashboard.css";

function percentage(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(value);
}

function rate(report: VariantReport, event: (typeof experimentFunnel)[number]["event"]): number {
  const opened = report.counts.quiz_opened;
  return opened === 0 ? 0 : report.counts[event] / opened;
}

function experimentConclusion(a: VariantReport, b: VariantReport): Readonly<{ title: string; detail: string; winner: QuizExperimentVariant | null }> {
  const nA = a.counts.quiz_opened;
  const nB = b.counts.quiz_opened;
  const conversionsA = a.counts.quiz_checkout_clicked;
  const conversionsB = b.counts.quiz_checkout_clicked;
  if (nA < 100 || nB < 100) {
    return {
      title: "Coletando uma amostra confiável",
      detail: `Ainda faltam ${String(Math.max(0, 100 - nA))} sessões em A e ${String(Math.max(0, 100 - nB))} em B para a primeira leitura.`,
      winner: null,
    };
  }
  const pooled = (conversionsA + conversionsB) / (nA + nB);
  const error = Math.sqrt(pooled * (1 - pooled) * (1 / nA + 1 / nB));
  const zScore = error === 0 ? 0 : (b.checkoutRate - a.checkoutRate) / error;
  if (Math.abs(zScore) < 1.96) {
    return {
      title: "Ainda não há uma vencedora",
      detail: "A diferença atual pode ser apenas variação natural. Continue o teste sem editar as versões.",
      winner: null,
    };
  }
  const winner = zScore > 0 ? "b" : "a";
  return {
    title: `Variante ${winner.toUpperCase()} lidera nos cliques com confiança estatística`,
    detail: "O cálculo usa 95% de confiança. A decisão comercial final ainda deve considerar compras aprovadas no checkout.",
    winner,
  };
}

export function ExperimentDashboard() {
  const [observations, setObservations] = useState<readonly ExperimentObservation[]>(() => readExperimentObservations());

  useEffect(() => {
    const refresh = () => setObservations(readExperimentObservations());
    window.addEventListener("storage", refresh);
    window.addEventListener("belvitale:ab-data", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("belvitale:ab-data", refresh);
    };
  }, []);

  const [a, b] = useMemo(() => buildExperimentReport(observations), [observations]);
  const conclusion = experimentConclusion(a, b);
  const totalSessions = a.counts.quiz_opened + b.counts.quiz_opened;
  const lift = a.checkoutRate === 0 ? 0 : (b.checkoutRate - a.checkoutRate) / a.checkoutRate;

  const exportData = () => {
    const payload = JSON.stringify({ experimentId: quizExperimentId, exportedAt: new Date().toISOString(), observations }, null, 2);
    const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${quizExperimentId}-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="ab-dashboard">
      <header className="ab-dashboard__header">
        <a className="ab-dashboard__brand" href="/" aria-label="Belvitale — página inicial">
          <img src="/brand/belvitale-wordmark-quiz.png" width="1960" height="300" alt="Belvitale" />
        </a>
        <span className="ab-dashboard__privacy"><i aria-hidden="true" /> Dados anônimos</span>
      </header>

      <section className="ab-dashboard__hero" aria-labelledby="ab-title">
        <div>
          <p className="ab-dashboard__eyebrow">Experimento ativo · {quizExperimentId}</p>
          <h1 id="ab-title">O que as pessoas fazem, <em>não apenas o que dizem.</em></h1>
          <p>Compare a jornada completa das variantes A e B. Uma pessoa permanece na mesma versão durante toda a experiência.</p>
        </div>
        <div className="ab-dashboard__qa" aria-label="Links para conferir as variantes">
          <a href="/quiz?ab=a" target="_blank" rel="noreferrer"><span>A</span><strong>{quizExperimentVariants.a.openingCta}</strong><i>Conferir ↗</i></a>
          <a href="/quiz?ab=b" target="_blank" rel="noreferrer"><span>B</span><strong>{quizExperimentVariants.b.openingCta}</strong><i>Conferir ↗</i></a>
        </div>
      </section>

      <section className="ab-dashboard__notice" aria-label="Escopo dos dados">
        <strong>Modo de validação local</strong>
        <p>Este painel reúne apenas eventos deste navegador. Para somar visitantes reais, conecte o adaptador já preparado a um endpoint ou ao GA4.</p>
      </section>

      <section className="ab-dashboard__metrics" aria-label="Resumo do experimento">
        <article><span>Sessões observadas</span><strong>{totalSessions}</strong><small>A {a.counts.quiz_opened} · B {b.counts.quiz_opened}</small></article>
        <article><span>Ida ao checkout A</span><strong>{percentage(a.checkoutRate)}</strong><small>{a.counts.quiz_checkout_clicked} cliques no checkout</small></article>
        <article><span>Ida ao checkout B</span><strong>{percentage(b.checkoutRate)}</strong><small>{b.counts.quiz_checkout_clicked} cliques no checkout</small></article>
        <article className={lift > 0 ? "is-positive" : ""}><span>Variação B × A</span><strong>{lift > 0 ? "+" : ""}{percentage(lift)}</strong><small>sobre clique para comprar</small></article>
      </section>

      <section className="ab-dashboard__decision" data-winner={conclusion.winner ?? "none"}>
        <span aria-hidden="true">{conclusion.winner === null ? "≈" : "✓"}</span>
        <div><p>Leitura responsável</p><h2>{conclusion.title}</h2><small>{conclusion.detail}</small></div>
      </section>

      <section className="ab-dashboard__funnel" aria-labelledby="funnel-title">
        <div className="ab-dashboard__section-title"><div><p>Jornada comparada</p><h2 id="funnel-title">Funil A × B</h2></div><span>Conversão sobre aberturas</span></div>
        <div className="ab-funnel" role="table" aria-label="Conversão por etapa e variante">
          <div className="ab-funnel__row ab-funnel__row--head" role="row">
            <span role="columnheader">Momento</span><span role="columnheader">A · Controle</span><span role="columnheader">B · Benefício</span>
          </div>
          {experimentFunnel.map((step) => (
            <div className="ab-funnel__row" role="row" key={step.event}>
              <strong role="rowheader">{step.label}</strong>
              {[a, b].map((report) => {
                const stepRate = rate(report, step.event);
                return <div className="ab-funnel__value" role="cell" key={report.variant}>
                  <span><i style={{ width: `${String(stepRate * 100)}%` }} /></span>
                  <b>{report.counts[step.event]}</b><small>{percentage(stepRate)}</small>
                </div>;
              })}
            </div>
          ))}
        </div>
      </section>

      <footer className="ab-dashboard__actions">
        <div><strong>Ferramentas de validação</strong><span>Nenhuma resposta, nome, telefone ou e-mail é salvo neste painel.</span></div>
        <div>
          <button type="button" onClick={() => seedExperimentObservations()}>Carregar demonstração</button>
          <button type="button" onClick={exportData} disabled={observations.length === 0}>Exportar JSON</button>
          <button className="is-danger" type="button" onClick={() => clearExperimentObservations()} disabled={observations.length === 0}>Limpar dados</button>
        </div>
      </footer>
    </main>
  );
}

declare global {
  interface WindowEventMap {
    "belvitale:ab-data": CustomEvent;
  }
}

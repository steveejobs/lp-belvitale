import { useEffect, useState } from "react";
import { recordHomeEvent } from "../analytics/homeEvents";
import { publishedFaqFacts } from "../data/faqFacts";
import { Reveal } from "./ui/Reveal";

function getFaqIdFromHash(): string | null {
  const id = window.location.hash.slice(1);
  return publishedFaqFacts.some((fact) => fact.id === id) ? id : null;
}

export function FaqSection() {
  const [openItems, setOpenItems] = useState<ReadonlySet<string>>(() => {
    const initialId = getFaqIdFromHash();
    return initialId === null ? new Set() : new Set([initialId]);
  });

  useEffect(() => {
    const openHashedItem = () => {
      const id = getFaqIdFromHash();
      if (id === null) return;
      setOpenItems((current) => new Set(current).add(id));
      window.requestAnimationFrame(() => {
        document
          .getElementById(`${id}-trigger`)
          ?.focus({ preventScroll: true });
      });
    };

    openHashedItem();
    window.addEventListener("hashchange", openHashedItem);
    return () => window.removeEventListener("hashchange", openHashedItem);
  }, []);

  function toggleItem(id: string) {
    const wasOpen = openItems.has(id);
    if (!wasOpen) recordHomeEvent("faq_open", { location: id });
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
        if (window.location.hash === `#${id}`) {
          window.history.replaceState(null, "", window.location.pathname);
        }
      } else {
        next.add(id);
        window.history.replaceState(null, "", `#${id}`);
      }
      return next;
    });
  }

  return (
    <section className="faq-section" id="faq" aria-labelledby="faq-title">
      <Reveal className="section-shell faq-section__layout" effect="slide-left">
        <div className="faq-section__heading">
          <p className="institutional-eyebrow">Dúvidas</p>
          <h2 id="faq-title">Dúvidas comuns, respostas sem rodeios.</h2>
          <p>
            O essencial para entender o uso, observar o rótulo e concluir a compra.
          </p>
        </div>

        <div className="faq-list">
          {publishedFaqFacts.map((fact, index) => {
            const isOpen = openItems.has(fact.id);
            const panelId = `${fact.id}-panel`;
            const triggerId = `${fact.id}-trigger`;

            return (
              <article className="faq-item" id={fact.id} key={fact.id}>
                <h3>
                  <button
                    id={triggerId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => toggleItem(fact.id)}
                  >
                    <span className="faq-item__number" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{fact.question}</span>
                    <span className="faq-item__icon" aria-hidden="true" />
                  </button>
                </h3>
                <div
                  className="faq-panel"
                  id={panelId}
                  role="region"
                  aria-labelledby={triggerId}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  data-open={isOpen}
                >
                  <div className="faq-panel__inner">
                    <p>{fact.answer}</p>
                    {fact.links === undefined ? null : (
                      <div className="faq-panel__links">
                        {fact.links.map((link) => (
                          <a href={link.href} key={link.href}>
                            {link.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

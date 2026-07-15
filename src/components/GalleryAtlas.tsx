import type { CSSProperties } from "react";
import { getGalleryAssets, type GalleryAsset } from "../data/galleryAssets";

const groupLabels: Record<GalleryAsset["group"], string> = {
  brand: "Marca",
  product: "Produto",
  routine: "Rotina",
  proof: "Resultados",
  label: "Rótulo",
  kit: "Kits",
};

function GalleryFigure({
  asset,
  index,
}: {
  readonly asset: GalleryAsset;
  readonly index: number;
}) {
  return (
    <figure
      className={`gallery-atlas__item gallery-atlas__item--${asset.group}`}
      data-asset-id={asset.id}
      style={{ "--asset-index": index } as CSSProperties}
    >
      <img
        src={asset.src}
        width={asset.width}
        height={asset.height}
        alt={asset.alt}
        loading={index < 3 ? "eager" : "lazy"}
        decoding="async"
      />
      <figcaption>
        <span>{asset.kicker}</span>
        <strong>{asset.title}</strong>
      </figcaption>
    </figure>
  );
}

export function GalleryAtlas() {
  const assets = getGalleryAssets();
  const publicCount = assets.filter((asset) => asset.availability === "public").length;
  const internalCount = assets.length - publicCount;
  const stats = [
    { label: "Total visível", value: assets.length },
    { label: "Publicáveis", value: publicCount },
    ...(internalCount > 0 ? [{ label: "Preview interno", value: internalCount }] : []),
  ];
  const introCopy =
    internalCount > 0
      ? "Marca, produto, rotina, resultados autorizados e kits entram em uma leitura única, com cada imagem no papel que ela consegue sustentar hoje."
      : "Resultados autorizados entram em uma leitura única, sem trazer para a página pública mídias que ainda dependem de validação.";

  if (assets.length === 0) return null;

  return (
    <section className="gallery-atlas" id="acervo" aria-labelledby="gallery-atlas-title">
      <div className="gallery-atlas__intro section-shell">
        <p className="eyebrow eyebrow--light">Acervo em cena</p>
        <h2 id="gallery-atlas-title">
          A campanha fica mais forte quando o material real aparece.
        </h2>
        <p>{introCopy}</p>
        <dl aria-label="Cobertura do acervo visual">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="gallery-atlas__groups section-shell" aria-label="Categorias do acervo">
        {Object.entries(groupLabels).map(([group, label]) => {
          const count = assets.filter((asset) => asset.group === group).length;
          if (count === 0) return null;
          return (
            <span key={group}>
              {label}
              <b>{count}</b>
            </span>
          );
        })}
      </div>

      <div className="gallery-atlas__rail" aria-label="Mosaico visual Belvitale">
        {assets.map((asset, index) => (
          <GalleryFigure asset={asset} index={index} key={asset.id} />
        ))}
      </div>
    </section>
  );
}

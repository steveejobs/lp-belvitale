export function RewardTease({ onUnlock }: { readonly onUnlock: () => void }) {
  return (
    <section className="q6-reward-tease" aria-labelledby="q6-reward-title">
      <div className="q6-reward-tease__meter" aria-hidden="true"><span /><span /><span /><span /></div>
      <p className="q6-eyebrow"><span /> Sua recompensa de conteúdo</p>
      <h2 id="q6-reward-title">Seu roteiro de retomada está pronto.</h2>
      <p>Ele transforma o perfil em sete dias de decisões menores. Sem sorteio, prêmio impossível ou cupom inventado.</p>
      <button className="q6-primary" type="button" onClick={onUnlock}>Desbloquear meu roteiro</button>
    </section>
  );
}

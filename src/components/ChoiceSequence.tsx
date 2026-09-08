import { Reveal } from "./ui/Reveal";
export function ChoiceSequence() {
  return (
    <section className="choice-sequence" id="liberdade" aria-labelledby="choice-title">
      <div className="section-shell home-recognition">
        <Reveal className="home-recognition__image" effect="scale">
          <img src="/lifestyle/freedom-01-768.webp" width="768" height="960" alt="Cena editorial de uma mulher junto à janela, em um momento tranquilo." loading="lazy" decoding="async" />
          <p>Vestir o que gosta.<br />Estar presente no momento.</p>
        </Reveal>
        <Reveal className="home-recognition__copy" effect="slide-right">
          <p className="eyebrow">Diferentes histórias. Um desejo em comum.</p>
          <h2 id="choice-title">Olhar para você.<br /><em>Além do que incomoda.</em></h2>
          <p>Às vezes é uma roupa que fica no armário. Uma foto que você olha duas vezes. Ou uma textura da pele que passou a chamar mais atenção.</p>
          <div className="home-moments">
            <article><span>Um incômodo que já existia</span><h3>“Isso já fazia parte da minha vida.”</h3><p>A celulite, a flacidez percebida ou a textura irregular acompanham você há algum tempo, mesmo com uma rotina de cuidados.</p></article>
            <article><span>Um novo momento do corpo</span><h3>“Percebi mais depois de emagrecer.”</h3><p>Seu corpo mudou e a aparência da pele ganhou outra importância. Agora, você quer entender como cuidar desse novo momento.</p></article>
          </div>
          <p className="home-recognition__closing">Você pode se reconhecer nas duas histórias. Não precisa se encaixar em uma só para começar a se cuidar.</p>
        </Reveal>
      </div>
    </section>
  );
}

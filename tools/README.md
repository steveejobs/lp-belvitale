# Ferramentas locais

Utilitarios de preparacao de assets que nao entram no bundle da aplicacao.

## Otimizacao de imagens

Instalar a dependencia em um ambiente Python isolado:

```powershell
python -m pip install -r tools/requirements.txt
```

Converter uma imagem para WebP, limitando a largura a 1600 px:

```powershell
python tools/optimize_images.py "entrada.png" "public/novo/entrada.webp" --max-width 1600 --quality 84
```

Para um recorte revisavel, informar `--crop x,y,width,height`. O script nunca modifica o arquivo de origem e nao amplia imagens. Sempre revisar visualmente a derivada antes de inclui-la no manifesto tipado.

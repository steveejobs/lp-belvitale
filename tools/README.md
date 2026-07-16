# Ferramentas locais

Utilitarios de preparacao de assets que nao entram no bundle da aplicacao.

## Otimizacao de imagens

Instalar a dependencia em um ambiente Python isolado:

```powershell
python -m pip install -r tools/requirements.txt
```

Converter uma imagem para WebP, limitando a maior dimensao a 1600 px:

```powershell
python tools/optimize_images.py "entrada.png" "public/novo/entrada.webp" --max-size 1600 --quality 84
```

O script corrige orientacao EXIF, preserva transparencia, nao amplia a imagem e se recusa a sobrescrever um arquivo sem `--overwrite`. Sempre manter o arquivo-fonte original fora do destino otimizado.

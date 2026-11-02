# Entradas suplementares — auditoria estática

Os quatro arquivos foram inspecionados localmente e não foram enviados ao repositório. Este documento registra apenas hashes, offsets observados e resultados de comparação.

| Arquivo | Tamanho | SHA-256 |
|---|---:|---|
| installer.bin | 501120 | `6f5f3e1fbfb036fc3a04806ccfef55f022995bf242c2fdc85f48e5ae1b45d7ed` |
| kpayload.bin | 32224 | `e749eb98ca6bd9c431560529b6f43f1deaeb429e29ed1820387c009fade44141` |
| hen (4).bin | 562240 | `92d99992d3720ed3c6a9b0d9405ba61a11892923eada67ea6ce3fe2c83934e48` |
| 1400.bin | 632 | `165d2ad966b3829d1fbcb53d5e7ecbc20563de4a6a49ee70d8126d0256a49c02` |

## Installer e kpayload

- Em `installer.bin`, a comparação `0x0578` em `0xbe69` resolve para a tabela `0x123a0`.
- Em `kpayload.bin`, a comparação `0x0578` em `0x3a9` resolve para a tabela `0x68e0`.
- As duas tabelas têm 89 dwords e são byte a byte idênticas.
- As 89 posições coincidem com a ordem e os valores do perfil público `kpayload_offsets` 14.00 de Scene-Collective/ps4-hen.
- O campo `sceSblPfsSetKeys_addr` é `0x006272b0` nos dois arquivos, igual ao `1400.c` público.

A tabela selecionada no `hen.bin` de referência anteriormente auditado contém `0x00627270` para esse campo. A diferença foi registrada, não substituída automaticamente no perfil proprietário do GoldHEN.

## Variante HEN

`hen (4).bin` tem o mesmo tamanho do `hen.bin` de referência, mas hash diferente e 385908 posições de bytes diferentes. A rotina em `0x4abb` compara SDK `0x1400` e `0x1352`; os ramos observados selecionam os valores imediatos `0x002bd950` e `0x002bd6a0`, respectivamente.

O mesmo fluxo usa quatro offsets relativos `0x390`, `0x3d4`, `0x454` e `0x474`. Os dois últimos coincidem com os offsets de processo já encontrados na referência HEN; os dois primeiros permanecem sem nome semântico. O helper `0x2bd950` não foi rotulado como `memcpy` somente pelo valor numérico.

A variante contém as strings `/data/cole-goldhen-disc-v1.bin` e `/data/cole-compatibility-audit-v1.bin`; ela deve permanecer separada do HEN de referência enquanto a proveniência e o comportamento não forem validados.

## Patch 14.00

O arquivo `1400.bin` tem 632 bytes e seu SHA-256 coincide com o hash do blob PKB incluído nas tabelas HX1400 deste repositório.

## Limites

Tudo acima é evidência estática. Não houve execução em PS4, comparação com dump limpo do kernel nem validação de estabilidade. Nenhum byte de GoldHEN foi modificado e nenhum perfil ou payload GoldHEN 14.00 foi gerado.

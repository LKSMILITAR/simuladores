# LKS MILITAR - SIMULADOR GEOMÉTRICO DE LINHA DE VISADA

https://lksmilitar.github.io/simuladores/radar_los_simulator_v2.html

# LKS MILITAR | Dinâmica de Equação de Radar & Geometria do Feixe

Análise Vetorial de Poynting, Tensão de Maxwell e Expansão do Lóbulo Principal

https://lksmilitar.github.io/simuladores/Index.html

Análise matemática da linha de visada horizontal (LOS) e restrições geométricas de ocultação pela curvatura terrestre.

## Visão Geral

Este repositório contém um simulador matemático autônomo desenvolvido pelo projeto LKS MILITAR. 

A ferramenta calcula e visualiza a obstrução geométrica da linha de visada entre um ponto de observação elevado (sensor ou observador) e um vetor alvo. O motor executa o cálculo do horizonte geodésico e da área de ocultação vertical provocada pela curvatura do planeta, operando como uma ferramenta estrita de modelagem geométrica.

Todos os cálculos e projeções baseiam-se em equações trigonométricas clássicas e parâmetros geodésicos padronizados.

## Escopo

- Geometria Espacial Aplicada
- Cálculo de Horizonte Geodésico
- Linha de Visada Horizontal (LOS)
- Zonas de Ocultação e Sombra Topográfica
- Modelagem de Raio Terrestre Efetivo

## Especificações Técnicas

O motor de cálculo processa a equação fundamental do horizonte visual ($d = \sqrt{2 \cdot R_e \cdot h + h^2}$) e oferece três configurações distintas de raio planetário efetivo ($R_e$) para fins de ajuste geométrico em análises de visibilidade:

- **Ajuste de Referência de Radar (Raio 4/3):** k=0,25 aplicado à expansão geométrica do horizonte utilitário.
- **Ajuste de Referência Óptica:** k=0,14 para a linha de visada corrigida por parâmetros geodésicos padrão.
- **Geometria Euclidiana Estrita:** k=0,0 para modelagem matemática teórica em vácuo absoluto, sem distorção de horizonte.

## Propósito

Este repositório e o software associado são destinados exclusivamente a fins educacionais, históricos, científicos e informativos.

O projeto não promove, incentiva, apoia ou glorifica a violência, conflitos armados ou o uso da força militar. Todas as análises e resultados são apresentados sob perspectivas estritamente técnicas, matemáticas, acadêmicas e de engenharia.

## Termos de Uso

Todos os materiais, algoritmos e informações contidos neste repositório são fornecidos "COMO ESTÃO", sem garantias de qualquer tipo, expressas ou implícitas.

O autor não assume qualquer responsabilidade pela precisão absoluta, integridade ou aplicação prática dos dados gerados pelo simulador. A validação das informações frente a manuais institucionais e fontes oficiais permanece obrigatória.

## Direitos Autorais

Copyright (c) 2026 Vitor Lucas Nunes - LKS MILITAR.

Todos os direitos reservados. A utilização, estudo e distribuição deste simulador são permitidos de forma gratuita, desde que mantidos explicitamente os créditos originais de autoria e a menção ao projeto LKS MILITAR.

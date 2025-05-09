# [ GΞΞK CΦDΞ ] - YouTube Thumbnail Downloader

## Descrição

Esta é uma aplicação web simples que permite aos usuários baixar thumbnails (miniaturas) de vídeos do YouTube. O usuário insere a URL de um vídeo do YouTube, a aplicação extrai o ID do vídeo, tenta buscar a thumbnail em diferentes resoluções (da mais alta para a mais baixa disponível) e, em seguida, permite o download da imagem. A interface é estilizada com um tema "geek/dark" e inclui feedback visual durante o processo.

O backend é escrito em PHP e utiliza cURL para buscar as imagens das URLs das thumbnails do YouTube. Inclui validação da URL e tratamento de erros.

## Funcionalidades

* **Extração de Thumbnail:**
    * Aceita URLs de vídeos do YouTube (formatos `youtube.com/watch?v=`, `youtu.be/`, `youtube.com/embed/`, `youtube.com/v/`, `youtube.com/shorts/`).
    * Também tenta carregar URLs diretas de imagens se fornecidas.
* **Seleção de Qualidade:**
    * Tenta buscar a thumbnail na melhor qualidade disponível, começando por `maxresdefault.jpg`, e depois tentando `hqdefault.jpg`, `mqdefault.jpg`, e `sddefault.jpg` como alternativas.
* **Pré-visualização:**
    * Exibe uma pré-visualização da thumbnail antes do download.
    * Mostra um spinner de carregamento enquanto a imagem está sendo buscada.
    * Fornece feedback visual em caso de erro ao carregar a prévia.
* **Download Direto:**
    * Permite o download da imagem da thumbnail diretamente para o dispositivo do usuário.
    * O nome do arquivo para download é extraído da URL da thumbnail ou padronizado para `thumbnail.jpg`/`png`/`webp`.
* **Interface Responsiva:**
    * O design se adapta a diferentes tamanhos de tela, com um tema escuro e acentos neon.
    * Utiliza Font Awesome para ícones.
* **Tratamento de Erros (Backend):**
    * Validação da URL da imagem do YouTube no lado do servidor.
    * Utiliza cURL para buscar a imagem, com timeouts e verificação de SSL.
    * Exibe mensagens de erro amigáveis na interface se o download da thumbnail falhar (por exemplo, URL inválida, erro de cURL, código HTTP não esperado).
    * Utiliza sessões PHP para passar mensagens de erro entre o processamento e a exibição.
* **PWA (Progressive Web App) Pronta:**
    * Inclui um `manifest.json` e favicons de diversos tamanhos, sugerindo prontidão para ser instalada como PWA.

## Tecnologias Utilizadas

* **Frontend:**
    * HTML5
    * CSS3 (com variáveis CSS, Flexbox, gradientes, sombras e design responsivo)
    * JavaScript (para manipulação do DOM, extração do ID do vídeo, lógica de pré-visualização e atualização da UI)
* **Backend:**
    * PHP (para processar a URL da imagem, usar cURL para buscar a imagem e forçar o download)
* **Outros:**
    * cURL (biblioteca PHP para fazer requisições HTTP)
    * Font Awesome (para ícones)
    * Google Fonts (Poppins, Fira Code)
    * `manifest.json` (para PWA)

## Como Usar

1.  **Acesse a Aplicação:** Abra o arquivo `index.php` em um navegador através de um servidor web com PHP habilitado.
2.  **Cole a URL:** No campo de entrada, cole a URL completa de um vídeo do YouTube do qual você deseja baixar a thumbnail.
    * Exemplos de URLs válidas:
        * `https://www.youtube.com/watch?v=VIDEO_ID`
        * `https://youtu.be/VIDEO_ID`
        * Você também pode tentar colar uma URL direta de uma imagem de thumbnail do YouTube (ex: `https://i.ytimg.com/vi/VIDEO_ID/maxresdefault.jpg`).
3.  **Pré-visualização:** A aplicação tentará carregar e exibir uma pré-visualização da thumbnail. Um spinner será mostrado durante o carregamento.
4.  **Download:** Se a pré-visualização for carregada com sucesso, o botão "Download Thumbnail" será habilitado. Clique nele para baixar a imagem.
5.  **Mensagens de Erro:** Se ocorrer um problema (URL inválida, falha ao buscar a imagem), uma mensagem de erro será exibida.

## Arquivos do Projeto

* `index.php`: O arquivo principal que contém a lógica PHP do backend, o HTML da interface, o CSS embutido e o JavaScript do frontend.
* `manifest.json`: Arquivo de manifesto para configuração como Progressive Web App.
* `favicon-*.png`: Diversos arquivos de favicon para diferentes resoluções (referenciados no `index.php` e `manifest.json`).
* `error_log.txt` (opcional): Pode ser gerado pelo servidor PHP para registrar erros. O erro presente indica um problema com `session_start()` sendo chamado após o envio de headers, o que já foi corrigido no código fornecido em `index.php` movendo o bloco PHP para o topo.

## Configuração do Servidor

* Para rodar esta aplicação, você precisará de um servidor web (como Apache ou Nginx) com PHP instalado e a extensão cURL habilitada.
* Nenhuma configuração de banco de dados é necessária para esta aplicação.

## Possíveis Melhorias

* Permitir que o usuário escolha explicitamente a resolução da thumbnail para download (maxres, hq, mq, sd).
* Adicionar uma opção para copiar a URL da imagem da thumbnail para a área de transferência.
* Melhorar ainda mais o tratamento de erros no frontend para diferentes cenários de falha da API do YouTube ou URLs malformadas.
* Implementar um sistema de cache para thumbnails frequentemente acessadas (se aplicável ao caso de uso).
* Separar o CSS e JavaScript em arquivos `.css` e `.js` externos para melhor organização, embora o `index.php` atual já esteja bem estruturado com comentários.

# Como publicar e começar a vender

Os dois lados funcionam assim:

- **A landing page** (esta pasta) fica hospedada de graça na Netlify.
- **A cobrança e a entrega do PDF** ficam na Kiwify (ou na Hotmart). A plataforma recebe o pagamento, parcela no cartão com juros pagos pelo comprador, manda o PDF por e-mail e cuida da garantia de 7 dias.

> ⚠️ **Nunca coloque o PDF dentro desta pasta.** Tudo o que está aqui fica público. O PDF fica só na plataforma de pagamento.

---

## 1. Crie o produto na Kiwify (cobrança + entrega)

1. Crie uma conta em **kiwify.com.br** e valide seus dados (CPF/CNPJ e conta bancária para receber).
2. Vá em **Produtos → Criar produto**, escolha produto digital / e-book.
3. Preencha:
   - **Nome:** Manual Prático das Lentes em Resina
   - **Preço:** R$ 37,00
   - **Arquivo:** envie o PDF do manual (é ele que o comprador recebe por e-mail)
   - **Garantia:** 7 dias
4. Nas configurações de pagamento do produto/checkout:
   - Ative **Pix, cartão e boleto**.
   - Em **parcelamento**, deixe até 12x com **juros por conta do comprador**. Assim você recebe os R$37 (menos a taxa da plataforma) e o cliente paga os juros da parcela.
5. Personalize o checkout com a capa (`site/img/capa.jpg`) e as cores roxo `#3a1f93` e laranja `#ff9a00`, para o cliente sentir continuidade com a página.
6. Copie o **link do checkout**.

*Prefere Hotmart?* O processo é o mesmo: cadastre o produto, envie o PDF, defina R$37, ative parcelamento com juros para o comprador e copie o link de pagamento. Os nomes dos menus mudam um pouco entre as plataformas, e as taxas também: confira as taxas atuais no site de cada uma antes de escolher.

## 2. Cole o link do checkout na página

Abra `site/index.html`, procure perto do final:

```js
var CHECKOUT_URL = "";
```

e cole o link entre as aspas:

```js
var CHECKOUT_URL = "https://pay.kiwify.com.br/SEU-LINK";
```

Todos os botões da página passam a levar para o checkout. Os parâmetros UTM do anúncio (`?utm_source=...`) são repassados automaticamente para o checkout, para você saber de onde veio cada venda.

## 3. Rodapé e foto da paciente

O rodapé já traz nome e CRO (CRO-RJ 42835), como exige a publicidade odontológica.

A página usa a foto de sorriso que já está no manual (página "Camada de esmalte"). Use-a apenas se você tiver o termo de autorização de imagem da paciente; se não tiver, troque `site/img/sorriso.jpg` por outra foto de caso seu, autorizada.

## 4. Publique na Netlify (grátis)

**Jeito mais simples (arrastar e soltar):**

1. Crie uma conta em **app.netlify.com**.
2. Vá em **Add new project → Deploy manually**.
3. Arraste a pasta `site` (dentro de `manual-lentes-resina`) para a área indicada.
4. Em segundos sai um endereço como `nome-aleatorio.netlify.app`. Em **Project configuration → Change project name** você pode trocar para algo como `manual-lentes-resina.netlify.app`.

**Domínio próprio (opcional):** em **Domain management → Add a domain** você liga um domínio seu (ex.: `manualdaslentes.com.br`, registrado no registro.br) e a Netlify gera o HTTPS sozinha.

**Para atualizar a página depois:** é só arrastar a pasta `site` de novo na aba **Deploys**.

## 5. Antes de anunciar

- [ ] Faça uma compra teste (pode ser uma compra real que você reembolsa depois) e confira se o PDF chega no e-mail.
- [ ] Clique em todos os botões da página no celular e veja se abrem o checkout.
- [ ] Se for anunciar no Instagram/Facebook, crie o Pixel da Meta, cole o código no `<head>` do `site/index.html` e configure o mesmo Pixel na Kiwify (ela dispara o evento de compra).

---

### O que tem na pasta `site`

| Arquivo | Para que serve |
|---|---|
| `index.html` | A landing page |
| `img/` | Capa, foto do autor, fotos clínicas e prévias de páginas do manual |
| `fonts/` | Fontes da página (hospedadas junto, carregam mais rápido) |
| `_headers` | Cache e segurança na Netlify |

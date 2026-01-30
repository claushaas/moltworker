# Migração Cloudflare-first (sem VPS) — Plano passo a passo (ultra detalhado)

> Objetivo: desligar a VPS, migrar *memória (SQLite)* + *entrada de canais* para Cloudflare (**Workers + D1 + Vectorize**), mantendo o **Mac mini** apenas como executor quando necessário (via **cloudflared/Zero Trust**).
>
> **Regra de ouro:** segurança primeiro. Migração antes de features novas.

---

## Como usar este plano
- Marque as checkboxes conforme concluir.
- Não avance para a próxima etapa sem a **saída esperada** e a **evidência** preenchida.
- Evite colar segredos (tokens/keys) nas evidências.

## Convenções / pastas
- Pasta desta migração: `./migration-cloudflare/`
- Evidências (outputs colados): `./migration-cloudflare/evidence/`
- Artefatos (exports/JSONL/dumps): `./migration-cloudflare/artifacts/`

## Fontes de referência (quando bater dúvida)
- Repo (Cloudflare): https://github.com/cloudflare/moltworker
- Blog (arquitetura/Browser Rendering/R2/D1/Vectorize): https://blog.cloudflare.com/moltworker-self-hosted-ai-agent/
- Docs Moltbot: https://docs.molt.bot
- OpenClaw (referência de agentes/workers): https://github.com/openclaw/openclaw

---

# FASE 0 — Pré-checks (inventário + risco)

## [X] 0.1 Congelar estado atual (inventário rápido)
**Por quê:** saber exatamente o que existe hoje na VPS (e o que ela faz), para substituirmos 1:1 com Cloudflare/Mac e desligarmos sem sustos.

**Quem:** Claus (executa), Bb (orienta/anota)

**Onde:** VPS (principal)

**Como (VPS — comandos para colar em `evidence/00_vps_inventory.md`):**
> Rode no terminal da VPS, copie/cole a saída no arquivo de evidência (sem segredos).

### Identificação do host
```bash
date
uname -a
uptime
whoami
pwd
```

### Docker / containers
```bash
docker --version
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'

docker compose version || true
# se você usa compose:
docker compose ls || true
# (se houver stacks específicos)
docker compose ps || true
```

### Rede / portas expostas
```bash
# portas em escuta
sudo ss -lntp || sudo netstat -lntp
# firewall (se aplicável)
sudo ufw status verbose || true
sudo iptables -S || true
```

### Systemd / serviços (se não for só docker)
```bash
systemctl --no-pager --type=service --state=running | head -n 200
```

### Cron do sistema (se existir)
```bash
crontab -l || true
sudo ls -la /etc/cron.* || true
sudo cat /etc/crontab 2>/dev/null || true
```

### Config do container do gateway (sem segredos)
```bash
# dica: faça inspect e REMOVA tokens antes de colar
# docker inspect <container_name>
```

**Saída esperada:**
- lista clara dos containers (incluindo o gateway), portas expostas e qualquer agendamento.

**Evidência:**
- `evidence/00_vps_inventory.md`

---

# FASE 1 — Preparar terreno na Cloudflare (DEV, paralelo, sem tocar no bot atual)

> Meta: criar tudo em DEV primeiro, e conectar um bot Telegram novo para testes.

## [ ] 1.1 Criar recursos Cloudflare (DEV)

**Por quê:** recursos (D1/Vectorize/Worker) precisam existir antes de migrarmos dados.

**Quem:** Claus (console Cloudflare), Bb (checklist)

**Onde:** Cloudflare Dashboard

### 1.1.1 Pré-requisitos (Cloudflare)
- [ ] Você tem uma conta Cloudflare com:
  - Workers habilitado
  - D1 habilitado
  - Vectorize habilitado
- [ ] Você sabe o **Account ID** e **zone** (se usar domínio próprio).

### 1.1.2 Criar D1 (DEV)
**O que é D1:** SQLite gerenciado (ótimo para texto + metadados). Vai ser a fonte de verdade.

**Decisões importantes (para não travar depois):**
- Nome: use um padrão com sufixo `_dev` (ex.: `bb_memory_dev`).
- Localidade/replicação: D1 é gerenciado; você não escolhe “região fixa” como em RDS. O que importa é manter o Worker e D1 no mesmo ecossistema Cloudflare.
- Schema: você vai aplicar depois (fase 2.2). Agora é só criar o banco.

**Passo-a-passo (Dashboard):**
1) Cloudflare Dashboard → **Workers & Pages**
2) Sidebar → **D1**
3) **Create database**
4) Nome: `bb_memory_dev`
5) Create

**Resultado esperado:** banco D1 criado e visível na lista.

### 1.1.3 Criar Vectorize (DEV)
**O que é Vectorize:** índice de embeddings (busca semântica). Não substitui o D1; complementa.

> Observação: o Vectorize foi criado via **Wrangler CLI** (o painel nem sempre expõe criação de índice), usando `--dimensions=1536 --metric=cosine`.

**Decisões importantes:**
- Nome: `bb_memory_vec_dev`
- Dimensão do embedding: depende do modelo de embeddings.
  - Se você usar OpenAI `text-embedding-3-small`, a dimensão é **1536**.
  - (se mudar o modelo, muda a dimensão; isso exige recriar o índice)
- Métrica: **cosine** (normalmente a melhor default)

**Passo-a-passo (Dashboard):**
1) Cloudflare Dashboard → **Workers & Pages**
2) Sidebar → **Vectorize**
3) **Create index**
4) Nome: `bb_memory_vec_dev`
5) Dimensions: `1536`
6) Metric: `cosine`
7) Create

**Resultado esperado:** índice Vectorize criado.

### 1.1.4 (Opcional) Criar R2 (DEV)
**Por quê (opcional agora):** para anexos/logs/artefatos. Não é necessário para começar com memória textual.

**Criado (DEV):**
- Bucket: `bb-artifacts-dev`

### 1.1.5 Criar o Worker (DEV)
**Por quê:** o Worker será o entrypoint do Telegram e mais tarde do Slack.

**Estratégia recomendada:** usar fork do `moltworker` para você controlar.

**Passo-a-passo (mínimo):**
1) Workers & Pages → **Overview**
2) Create → **Worker** (ou via `wrangler` depois)
3) Nome: `bb-worker-dev`

**Evidência:**
- `evidence/01_cloudflare_resources_dev.md` (anotar nomes/IDs)

---

## [X] 1.2 Criar bot Telegram *novo* (paralelo)

**Por quê:** testar Worker sem interromper o bot atual.

**Quem:** Claus

**Onde:** Telegram (BotFather)

**Passo-a-passo:**
1) Abra o BotFather
2) `/newbot`
3) Nome (display): `Bb Cloud Dev`
4) Username: algo tipo `bb_cloud_dev_bot`
5) Guarde o token (não cole em lugar público)

**Configurar secret no Cloudflare (sem vazar):**
- Workers & Pages → seu Worker `bb-worker-dev` → **Settings** → **Variables** → **Secrets**
- Adicionar secret `TELEGRAM_BOT_TOKEN`
- (Opcional, recomendado) adicionar `TELEGRAM_WEBHOOK_SECRET` para validar a origem (se o modelo do worker suportar)

**Evidência:**
- `evidence/02_telegram_bot_dev.md`

---

## [ ] 1.3 Deploy inicial do Worker (stub) + healthcheck

**Por quê:** validar wrangler + deploy + logs antes de mexer em dados.

**Quem:** Claus (executa), Bb (orienta)

**Onde:** Mac mini + Cloudflare

### 1.3.1 Instalar ferramentas (Mac)
```bash
node -v
npm -v
npm i -g wrangler
wrangler --version
wrangler login
```

### 1.3.2 Clonar o repo
```bash
cd /Users/claus/clawd
# ideal: fork seu
# git clone git@github.com:<seu-user>/moltworker.git
# ou upstream:
# git clone https://github.com/cloudflare/moltworker.git
cd moltworker
```

### 1.3.3 Criar `wrangler.toml` (DEV)
> Ajustar conforme estrutura do repo, mas os bindings típicos são:

- D1 binding
- Vectorize binding
- Vars/Secrets

Exemplo (modelo, NÃO copie sem adaptar):
```toml
name = "bb-worker-dev"
main = "src/index.ts"
compatibility_date = "2026-01-30"

[[d1_databases]]
binding = "DB"
database_name = "bb_memory_dev"
database_id = "<id>"

[[vectorize]]
binding = "VEC"
index_name = "bb_memory_vec_dev"

[vars]
ENV = "dev"
```

### 1.3.4 Deploy
```bash
wrangler deploy
```

### 1.3.5 Healthcheck
```bash
curl -i https://<seu-worker>.<seu-subdominio>.workers.dev/health
```

**Saída esperada:**
- deploy ok
- `/health` retorna 200

**Evidência:**
- `evidence/03_worker_deploy_dev.md`

---

# FASE 2 — Inspecionar e exportar memória (SQLite -> JSONL)

> Fonte confirmada: `~/.clawdbot/memory/main.sqlite`

## [ ] 2.1 Inspecionar tabelas e schema

**Por quê:** não assumir schema; exportar apenas o necessário.

**Quem:** Claus (executa), Bb (mapeia)

**Onde:** Mac mini

**Comandos (cole outputs):**
```bash
sqlite3 ~/.clawdbot/memory/main.sqlite '.tables'
sqlite3 ~/.clawdbot/memory/main.sqlite '.schema'
```

Se o `.schema` for gigante:
```bash
sqlite3 ~/.clawdbot/memory/main.sqlite '.schema' | head -n 200
```

**Saída esperada:** Bb consegue identificar quais tabelas representam mensagens e metadados.

**Evidência:**
- `evidence/04_sqlite_tables.md`
- `evidence/05_sqlite_schema.md`

---

# FASE 2.2 — Schema alvo no D1 (DEV)

## [ ] 2.2 Aplicar schema no D1

**Por quê:** padronizar memória no cloud.

**Quem:** Bb (gera schema), Claus (aplica)

**Onde:** Mac mini (wrangler) + Cloudflare D1

**Como:**
1) Bb cria `artifacts/d1_schema.sql`
2) Claus aplica:
```bash
# exemplo; ajustar conforme o nome do binding DB no wrangler.toml
wrangler d1 execute bb_memory_dev --file=./migration-cloudflare/artifacts/d1_schema.sql
```

**Saída esperada:** tabelas criadas.

**Evidência:**
- `evidence/06_d1_schema_apply.md`

---

# FASE 2.3 — Exportar SQLite -> JSONL

## [ ] 2.3 Exportar JSONL

**Por quê:** JSONL é auditável, reprocessável e evita depender do schema interno do Clawdbot.

**Quem:** Bb (script), Claus (executa)

**Onde:** Mac mini

**Como:**
1) Bb cria script de export em `migration-cloudflare/scripts/export_sqlite_to_jsonl.py`
2) Claus roda:
```bash
cd /Users/claus/clawd/migration-cloudflare
python3 scripts/export_sqlite_to_jsonl.py \
  --sqlite ~/.clawdbot/memory/main.sqlite \
  --out artifacts/memory_export.jsonl

wc -l artifacts/memory_export.jsonl
ls -lh artifacts/memory_export.jsonl
```

**Saída esperada:** arquivo existe e tem linhas > 0.

**Evidência:**
- `evidence/07_export_run.md`

---

# FASE 3 — Importar no D1 e indexar Vectorize

## [ ] 3.1 Importar JSONL -> D1

**Quem:** Bb (script), Claus (executa)

**Onde:** Mac mini

**Como:**
```bash
cd /Users/claus/clawd/migration-cloudflare
node scripts/import_jsonl_to_d1.js \
  --jsonl artifacts/memory_export.jsonl \
  --d1 bb_memory_dev
```

**Verificação (exemplo):**
```bash
wrangler d1 execute bb_memory_dev --command "SELECT COUNT(*) AS n FROM messages;"
```

**Saída esperada:** COUNT no D1 ~ lines do JSONL.

**Evidência:**
- `evidence/08_import_d1.md`

## [ ] 3.2 Gerar embeddings e upsert no Vectorize

**Quem:** Bb (script), Claus (executa)

**Onde:** Mac mini

**Como (com rate limit controlado):**
```bash
cd /Users/claus/clawd/migration-cloudflare
node scripts/embed_and_upsert_vectorize.js \
  --d1 bb_memory_dev \
  --vectorize bb_memory_vec_dev \
  --batch 50 \
  --sleep-ms 250
```

**Saída esperada:** logs mostram upsert de N vetores.

**Evidência:**
- `evidence/09_vectorize_upsert.md`

---

# FASE 4 — Telegram DEV bot E2E (Worker)

## [ ] 4.1 Implementar webhook Telegram no Worker

**Quem:** Bb (código), Claus (deploy)

**Onde:** Cloudflare Worker + Telegram

**Como (alto nível com detalhes de configuração):**
1) Worker recebe update Telegram
2) Valida (secret token/header se implementado)
3) Persiste mensagem no D1
4) Faz recall (Vectorize → ids → D1)
5) Chama LLM
6) Responde Telegram

### 4.1.1 Configurar webhook do bot DEV
- Use a API do Telegram `setWebhook` apontando para o Worker.
- (Se suportado) usar `secret_token` e validar no Worker.

**Saída esperada:** enviar mensagem pro bot DEV e receber resposta.

**Evidência:**
- `evidence/10_telegram_e2e.md`

## [ ] 4.2 Hardening (antes do bot oficial)

Checklist:
- [ ] secrets no Cloudflare (nada no repo)
- [ ] validação do webhook
- [ ] rate limiting
- [ ] logs sem PII/tokens

**Evidência:**
- `evidence/11_security_hardening.md`

---

# FASE 5 — Cutover + desligar VPS

## [ ] 5.1 Cutover do bot oficial para o Worker

**Quem:** Claus

**Como:**
- Mudar webhook do bot oficial
- Monitorar logs

**Evidência:** `evidence/12_cutover_telegram.md`

## [ ] 5.2 Desligar VPS

**Quem:** Claus

**Como:**
- Parar container
- Encerrar VPS

**Evidência:** `evidence/13_vps_shutdown.md`

---

# FASE 6 — Mac executor via cloudflared (somente quando necessário)

## [ ] 6.1 Subir cloudflared tunnel

**Quem:** Claus

**Como:**
- Instalar cloudflared
- Criar tunnel
- Proteger com Zero Trust (Service Token)

**Evidência:** `evidence/14_cloudflared_tunnel.md`

## [ ] 6.2 Executor API (allowlist)

**Quem:** Bb (código), Claus (rodar no Mac)

**Como:**
- API com `jobType` allowlisted (sem shell livre)

**Evidência:** `evidence/15_executor_api.md`

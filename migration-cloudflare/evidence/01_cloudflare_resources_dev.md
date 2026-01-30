# Evidência 01 — Recursos Cloudflare (DEV)

Cole/registre aqui (sem tokens):

## Conta / projeto
- Account ID: 
- Projeto/pasta (opcional): 

## Worker
- Repo (fork): git@github.com:claushaas/moltworker.git
- Nome do Worker (DEV): bb-worker-dev
- URL workers.dev (se já existir): https://bb-worker-dev.chaas.workers.dev

## D1
- Nome do D1 (DEV): 
- Database ID (via wrangler ou dashboard): 

## Vectorize
- Nome do Vectorize index (DEV): bb_memory_vec_dev
- Dimensions: 1536
- Metric: cosine

## R2
- Bucket (DEV): bb-artifacts-dev

## Observações
- Qualquer detalhe de config relevante (ex.: env=dev, etc.)

Account Id: e98f7dcfa0532dc3f086c08e96d8e826
Subdomain: chaas.workers.dev

D1 ID: c762cadf-c23f-4393-91a5-62ae06916566
D1 name: bb_memory_dev

➜  ~ wrangler login                                                     

 ⛅️ wrangler 4.61.1
───────────────────
Attempting to login via OAuth...
Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth?response_type=code&client_id=54d11594-84e4-41aa-b438-e81b8fa78ee7&redirect_uri=http%3A%2F%2Flocalhost%3A8976%2Foauth%2Fcallback&scope=account%3Aread%20user%3Aread%20workers%3Awrite%20workers_kv%3Awrite%20workers_routes%3Awrite%20workers_scripts%3Awrite%20workers_tail%3Aread%20d1%3Awrite%20pages%3Awrite%20zone%3Aread%20ssl_certs%3Awrite%20ai%3Awrite%20queues%3Awrite%20pipelines%3Awrite%20secrets_store%3Awrite%20containers%3Awrite%20cloudchamber%3Awrite%20connectivity%3Aadmin%20offline_access&state=50kO0JyoZlOIptMTchuTaFnCDnDqIBr.&code_challenge=OGVpa4akzETXaX6jIfyAgY6PXmXKSWFu-XNbv4myPUc&code_challenge_method=S256
Successfully logged in.
➜  ~ wrangler vectorize create bb_memory_vec_dev --dimensions=1536 --metric=cosine

 ⛅️ wrangler 4.61.1
───────────────────
🚧 Creating index: 'bb_memory_vec_dev'
✅ Successfully created a new Vectorize index: 'bb_memory_vec_dev'
To access your new Vectorize Index in your Worker, add the following snippet to your configuration file:
{
  "vectorize": [
    {
      "binding": "VECTORIZE",
      "index_name": "bb_memory_vec_dev"
    }
  ]
}
➜  ~ wrangler vectorize list
wrangler vectorize get bb_memory_vec_dev

 ⛅️ wrangler 4.61.1
───────────────────
📋 Listing Vectorize indexes...
┌───────────────────┬────────────┬────────┬─────────────┬─────────────────────────────┬─────────────────────────────┐
│ name              │ dimensions │ metric │ description │ created                     │ modified                    │
├───────────────────┼────────────┼────────┼─────────────┼─────────────────────────────┼─────────────────────────────┤
│ bb_memory_vec_dev │ 1536       │ cosine │             │ 2026-01-30T05:04:18.479487Z │ 2026-01-30T05:04:18.479487Z │
└───────────────────┴────────────┴────────┴─────────────┴─────────────────────────────┴─────────────────────────────┘

 ⛅️ wrangler 4.61.1
───────────────────
┌───────────────────┬────────────┬────────┬─────────────┬─────────────────────────────┬─────────────────────────────┐
│ name              │ dimensions │ metric │ description │ created                     │ modified                    │
├───────────────────┼────────────┼────────┼─────────────┼─────────────────────────────┼─────────────────────────────┤
│ bb_memory_vec_dev │ 1536       │ cosine │             │ 2026-01-30T05:04:18.479487Z │ 2026-01-30T05:04:18.479487Z │
└───────────────────┴────────────┴────────┴─────────────┴─────────────────────────────┴─────────────────────────────┘
➜  ~ 
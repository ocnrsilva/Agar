# ==========================================
# Estágio 1: Build da Aplicação React / Vite
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependências
COPY package.json ./

# Instala as dependências do projeto
RUN npm install

# Copia todo o código-fonte
COPY . .

# Executa a compilação do projeto para a pasta /app/dist
RUN npm run build

# ==========================================
# Estágio 2: Servidor Nginx para Produção
# ==========================================
FROM nginx:alpine

# Copia a configuração personalizada do Nginx com suporte a SPA e Gzip
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos gerados no estágio de build para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expõe a porta 80 interna do container
EXPOSE 80

# Inicia o Nginx em primeiro plano
CMD ["nginx", "-g", "daemon off;"]

# Usar Node.js 18 Alpine como base
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Criar diretório de uploads
RUN mkdir -p uploads

# Expor porta
EXPOSE 4000

# Definir variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=4000

# Comando para iniciar a aplicação
CMD ["npm", "start"] 
var axios = require("axios").default;

// CORRECTED REQUEST - Using port 4000 instead of 3000
var options = {
  method: 'POST',
  url: 'http://http://135.181.249.37:4000/api/alunos', // ✅ CORRECTED PORT
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6MSwiZW1haWwiOiJzdXBlcmFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzUwNzY2Nzc0LCJleHAiOjE3NTA3Njc2NzR9.9o5ROm7BC2fLojiU_0fVpcrWrshbBbCGTEHxyWszEt4'
  },
  data: {
    "id_escola": 1,
    "numero_ficha": "FICHA004", // ✅ Changed to avoid duplicate
    "nome_completo": "Maria João",
    "apelido": "Machava",
    "data_nascimento": "1999-06-15",
    "estado_civil": "Solteiro(a)",
    "nome_pai": "João Carlos",
    "nome_mae": "Ana Maria",
    "local_nascimento": "Beira",
    "tipo_identificacao": "BI",
    "numero_identificacao": "987654321X", // ✅ Changed to avoid duplicate
    "pais_origem": "Moçambique",
    "profissao": "Professora",
    "endereco": "Rua Central, 123",
    "numero_casa": "12",
    "telefone_principal": "+258842223334",
    "telefone_alternativo": "+258822223334",
    "email": "maria.joao.new@example.com", // ✅ Changed to avoid duplicate
    "genero": "Feminino",
    "foto_url": "http://example.com/maria.jpg"
  }
};

console.log("🚀 Enviando requisição corrigida para criar aluno...");
console.log("📍 URL:", options.url);
console.log("📋 Dados:", JSON.stringify(options.data, null, 2));

axios.request(options).then(function (response) {
  console.log("✅ SUCESSO!");
  console.log("📋 Resposta:", response.data);
}).catch(function (error) {
  console.error("❌ ERRO:");
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Dados:", error.response.data);
  } else {
    console.error("Erro de rede:", error.message);
  }
}); 
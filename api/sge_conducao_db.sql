/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE DATABASE IF NOT EXISTS `sge_conducao` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `sge_conducao`;

CREATE TABLE IF NOT EXISTS `alunos` (
  `id_aluno` int NOT NULL AUTO_INCREMENT,
  `id_escola` int NOT NULL,
  `numero_ficha` varchar(50) NOT NULL,
  `nome_completo` varchar(255) NOT NULL,
  `apelido` varchar(255) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `nome_pai` varchar(255) DEFAULT NULL,
  `nome_mae` varchar(255) DEFAULT NULL,
  `local_nascimento` varchar(255) DEFAULT NULL,
  `tipo_identificacao` varchar(50) DEFAULT NULL,
  `numero_identificacao` varchar(100) NOT NULL,
  `pais_origem` varchar(100) DEFAULT NULL,
  `profissao` varchar(100) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `numero_casa` varchar(50) DEFAULT NULL,
  `telefone_principal` varchar(50) NOT NULL,
  `telefone_alternativo` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `genero` varchar(10) DEFAULT NULL,
  `foto_url` varchar(255) DEFAULT NULL,
  `data_registo` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aluno`),
  UNIQUE KEY `numero_ficha` (`numero_ficha`),
  UNIQUE KEY `numero_identificacao` (`numero_identificacao`),
  KEY `id_escola` (`id_escola`),
  CONSTRAINT `alunos_ibfk_1` FOREIGN KEY (`id_escola`) REFERENCES `escolas` (`id_escola`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `aulas` (
  `id_aula` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `id_instrutor` int NOT NULL,
  `tipo_aula` varchar(50) NOT NULL,
  `data_aula` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time NOT NULL,
  `duracao_minutos` int DEFAULT NULL,
  `rubrica_aluno` tinyint(1) DEFAULT '0',
  `rubrica_instrutor` tinyint(1) DEFAULT '0',
  `observacoes` text,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_aula`),
  KEY `id_matricula` (`id_matricula`),
  KEY `id_instrutor` (`id_instrutor`),
  CONSTRAINT `aulas_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`),
  CONSTRAINT `aulas_ibfk_2` FOREIGN KEY (`id_instrutor`) REFERENCES `utilizadores` (`id_utilizador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `categoriascarta` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `codigo_categoria` varchar(20) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `tipo` varchar(50) NOT NULL,
  `preco` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `codigo_categoria` (`codigo_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `escolas` (
  `id_escola` int NOT NULL AUTO_INCREMENT,
  `nome_escola` varchar(255) NOT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `distrito` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `nuit` varchar(50) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_escola`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `escola_utilizadores` (
  `id_escola_utilizador` int NOT NULL AUTO_INCREMENT,
  `id_escola` int NOT NULL,
  `id_utilizador` int NOT NULL,
  `data_atribuicao` datetime DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id_escola_utilizador`),
  UNIQUE KEY `id_escola` (`id_escola`,`id_utilizador`),
  KEY `id_utilizador` (`id_utilizador`),
  CONSTRAINT `escola_utilizadores_ibfk_1` FOREIGN KEY (`id_escola`) REFERENCES `escolas` (`id_escola`),
  CONSTRAINT `escola_utilizadores_ibfk_2` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizadores` (`id_utilizador`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `exames` (
  `id_exame` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `numero_tentativa` int NOT NULL,
  `tipo_exame` varchar(50) NOT NULL,
  `data_exame` date NOT NULL,
  `resultado` varchar(50) DEFAULT NULL,
  `observacoes` text,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_exame`),
  UNIQUE KEY `id_matricula` (`id_matricula`,`tipo_exame`,`numero_tentativa`),
  CONSTRAINT `exames_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `matriculas` (
  `id_matricula` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_escola` int NOT NULL,
  `id_categoria_carta` int NOT NULL,
  `data_matricula` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_inicio_curso` date DEFAULT NULL,
  `horario_inicio_curso` time DEFAULT NULL,
  `duracao_contrato_meses` int DEFAULT NULL,
  `custo_total_curso` decimal(10,2) NOT NULL,
  `status_matricula` varchar(50) NOT NULL DEFAULT 'Ativa',
  `data_fim_instrucao` date DEFAULT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_matricula`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_escola` (`id_escola`),
  KEY `id_categoria_carta` (`id_categoria_carta`),
  CONSTRAINT `matriculas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `alunos` (`id_aluno`),
  CONSTRAINT `matriculas_ibfk_2` FOREIGN KEY (`id_escola`) REFERENCES `escolas` (`id_escola`),
  CONSTRAINT `matriculas_ibfk_3` FOREIGN KEY (`id_categoria_carta`) REFERENCES `categoriascarta` (`id_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `pagamentos` (
  `id_pagamento` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `id_parcela` int DEFAULT NULL,
  `data_pagamento` datetime DEFAULT CURRENT_TIMESTAMP,
  `valor_pago` decimal(10,2) NOT NULL,
  `metodo_pagamento` varchar(50) DEFAULT NULL,
  `observacoes` text,
  `registado_por` int DEFAULT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_pagamento`),
  KEY `id_matricula` (`id_matricula`),
  KEY `id_parcela` (`id_parcela`),
  KEY `registado_por` (`registado_por`),
  CONSTRAINT `pagamentos_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`),
  CONSTRAINT `pagamentos_ibfk_2` FOREIGN KEY (`id_parcela`) REFERENCES `parcelas` (`id_parcela`),
  CONSTRAINT `pagamentos_ibfk_3` FOREIGN KEY (`registado_por`) REFERENCES `utilizadores` (`id_utilizador`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `parcelas` (
  `id_parcela` int NOT NULL AUTO_INCREMENT,
  `id_matricula` int NOT NULL,
  `numero_parcela` int NOT NULL,
  `valor_devido` decimal(10,2) NOT NULL,
  `data_vencimento` date NOT NULL,
  `status_parcela` varchar(50) NOT NULL DEFAULT 'Pendente',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_parcela`),
  UNIQUE KEY `id_matricula` (`id_matricula`,`numero_parcela`),
  CONSTRAINT `parcelas_ibfk_1` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `refresh_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_utilizador` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `revoked` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_utilizador` (`id_utilizador`),
  KEY `token` (`token`),
  CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`id_utilizador`) REFERENCES `utilizadores` (`id_utilizador`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `tiposutilizador` (
  `id_tipo_utilizador` int NOT NULL AUTO_INCREMENT,
  `nome_tipo` varchar(100) NOT NULL,
  `descricao` text,
  PRIMARY KEY (`id_tipo_utilizador`),
  UNIQUE KEY `nome_tipo` (`nome_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `utilizadores` (
  `id_utilizador` int NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha_hash` varchar(255) NOT NULL,
  `telefone` varchar(50) DEFAULT NULL,
  `id_tipo_utilizador` int NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_utilizador`),
  UNIQUE KEY `email` (`email`),
  KEY `id_tipo_utilizador` (`id_tipo_utilizador`),
  CONSTRAINT `utilizadores_ibfk_1` FOREIGN KEY (`id_tipo_utilizador`) REFERENCES `tiposutilizador` (`id_tipo_utilizador`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
  id_veiculo INT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(20) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  ano INT NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  id_escola INT NOT NULL,
  id_instrutor INT DEFAULT NULL,
  PRIMARY KEY (id_veiculo),
  UNIQUE KEY (placa),
  KEY (id_escola),
  KEY (id_instrutor),
  CONSTRAINT fk_veiculo_escola FOREIGN KEY (id_escola) REFERENCES escolas(id_escola),
  CONSTRAINT fk_veiculo_instrutor FOREIGN KEY (id_instrutor) REFERENCES utilizadores(id_utilizador)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;

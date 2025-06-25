/**
 * Utilitários para construção de consultas SQL dinâmicas
 */

/**
 * Construir cláusula WHERE dinâmica
 * @param {Object} filters - Objeto com filtros
 * @param {Array} allowedFields - Campos permitidos para filtro
 * @returns {Object} - { whereClause, params }
 */
function buildWhereClause(filters, allowedFields = []) {
    const conditions = [];
    const params = [];

    if (!filters || typeof filters !== 'object') {
        return { whereClause: '', params: [] };
    }

    Object.keys(filters).forEach(key => {
        if (allowedFields.length === 0 || allowedFields.includes(key)) {
            const value = filters[key];
            
            if (value !== undefined && value !== null && value !== '') {
                if (typeof value === 'string' && value.includes('%')) {
                    // Busca com LIKE
                    conditions.push(`${key} LIKE ?`);
                    params.push(value);
                } else if (Array.isArray(value)) {
                    // Busca com IN
                    const placeholders = value.map(() => '?').join(', ');
                    conditions.push(`${key} IN (${placeholders})`);
                    params.push(...value);
                } else {
                    // Busca exata
                    conditions.push(`${key} = ?`);
                    params.push(value);
                }
            }
        }
    });

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    
    return { whereClause, params };
}

/**
 * Construir cláusula ORDER BY dinâmica
 * @param {string|Object} sort - Campo ou objeto de ordenação
 * @param {Array} allowedFields - Campos permitidos para ordenação
 * @param {string} defaultSort - Ordenação padrão
 * @returns {string} - Cláusula ORDER BY
 */
function buildOrderClause(sort, allowedFields = [], defaultSort = 'id DESC') {
    if (!sort) {
        return `ORDER BY ${defaultSort}`;
    }

    if (typeof sort === 'string') {
        const [field, direction] = sort.split(':');
        const order = direction?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        
        if (allowedFields.length === 0 || allowedFields.includes(field)) {
            return `ORDER BY ${field} ${order}`;
        }
    }

    if (typeof sort === 'object') {
        const orderClauses = [];
        
        Object.keys(sort).forEach(field => {
            if (allowedFields.length === 0 || allowedFields.includes(field)) {
                const direction = sort[field]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
                orderClauses.push(`${field} ${direction}`);
            }
        });

        if (orderClauses.length > 0) {
            return `ORDER BY ${orderClauses.join(', ')}`;
        }
    }

    return `ORDER BY ${defaultSort}`;
}

/**
 * Construir cláusula LIMIT e OFFSET para paginação
 * @param {number} page - Número da página
 * @param {number} limit - Itens por página
 * @returns {Object} - { limitClause, params }
 */
function buildPaginationClause(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const limitClause = `LIMIT ? OFFSET ?`;
    const params = [parseInt(limit), parseInt(offset)];
    
    return { limitClause, params };
}

/**
 * Construir consulta SELECT completa com filtros, ordenação e paginação
 * @param {string} table - Nome da tabela
 * @param {Array} fields - Campos a selecionar
 * @param {Object} filters - Filtros
 * @param {string|Object} sort - Ordenação
 * @param {number} page - Página
 * @param {number} limit - Limite
 * @param {Array} allowedFields - Campos permitidos
 * @returns {Object} - { query, params }
 */
function buildSelectQuery(table, fields = ['*'], filters = {}, sort = null, page = 1, limit = 10, allowedFields = []) {
    const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
    
    const { whereClause, params: whereParams } = buildWhereClause(filters, allowedFields);
    const orderClause = buildOrderClause(sort, allowedFields);
    const { limitClause, params: paginationParams } = buildPaginationClause(page, limit);
    
    const query = `
        SELECT ${fieldList}
        FROM ${table}
        ${whereClause}
        ${orderClause}
        ${limitClause}
    `.trim();
    
    const params = [...whereParams, ...paginationParams];
    
    return { query, params };
}

/**
 * Construir consulta COUNT para paginação
 * @param {string} table - Nome da tabela
 * @param {Object} filters - Filtros
 * @param {Array} allowedFields - Campos permitidos
 * @returns {Object} - { query, params }
 */
function buildCountQuery(table, filters = {}, allowedFields = []) {
    const { whereClause, params } = buildWhereClause(filters, allowedFields);
    
    const query = `
        SELECT COUNT(*) as total
        FROM ${table}
        ${whereClause}
    `.trim();
    
    return { query, params };
}

/**
 * Construir consulta INSERT
 * @param {string} table - Nome da tabela
 * @param {Object} data - Dados a inserir
 * @returns {Object} - { query, params }
 */
function buildInsertQuery(table, data) {
    const fields = Object.keys(data);
    const placeholders = fields.map(() => '?').join(', ');
    const params = Object.values(data);
    
    const query = `
        INSERT INTO ${table} (${fields.join(', ')})
        VALUES (${placeholders})
    `.trim();
    
    return { query, params };
}

/**
 * Construir consulta UPDATE
 * @param {string} table - Nome da tabela
 * @param {Object} data - Dados a atualizar
 * @param {string} idField - Campo ID
 * @param {number} id - Valor do ID
 * @returns {Object} - { query, params }
 */
function buildUpdateQuery(table, data, idField = 'id', id) {
    const fields = Object.keys(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const params = [...Object.values(data), id];
    
    const query = `
        UPDATE ${table}
        SET ${setClause}
        WHERE ${idField} = ?
    `.trim();
    
    return { query, params };
}

/**
 * Construir consulta DELETE
 * @param {string} table - Nome da tabela
 * @param {string} idField - Campo ID
 * @param {number} id - Valor do ID
 * @returns {Object} - { query, params }
 */
function buildDeleteQuery(table, idField = 'id', id) {
    const query = `
        DELETE FROM ${table}
        WHERE ${idField} = ?
    `.trim();
    
    return { query, params: [id] };
}

/**
 * Construir consulta com JOIN
 * @param {string} table - Tabela principal
 * @param {Array} joins - Array de objetos de JOIN
 * @param {Array} fields - Campos a selecionar
 * @param {Object} filters - Filtros
 * @param {string|Object} sort - Ordenação
 * @param {number} page - Página
 * @param {number} limit - Limite
 * @returns {Object} - { query, params }
 */
function buildJoinQuery(table, joins = [], fields = ['*'], filters = {}, sort = null, page = 1, limit = 10) {
    const fieldList = Array.isArray(fields) ? fields.join(', ') : fields;
    
    const joinClause = joins.map(join => {
        return `${join.type || 'INNER'} JOIN ${join.table} ON ${join.condition}`;
    }).join(' ');
    
    const { whereClause, params: whereParams } = buildWhereClause(filters);
    const orderClause = buildOrderClause(sort);
    const { limitClause, params: paginationParams } = buildPaginationClause(page, limit);
    
    const query = `
        SELECT ${fieldList}
        FROM ${table}
        ${joinClause}
        ${whereClause}
        ${orderClause}
        ${limitClause}
    `.trim();
    
    const params = [...whereParams, ...paginationParams];
    
    return { query, params };
}

/**
 * Sanitizar string para uso em consultas SQL
 * @param {string} str - String a sanitizar
 * @returns {string} - String sanitizada
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    
    // Remover caracteres perigosos
    return str.replace(/[;'"\\]/g, '');
}

/**
 * Validar se um campo é permitido
 * @param {string} field - Campo a validar
 * @param {Array} allowedFields - Campos permitidos
 * @returns {boolean} - Se o campo é permitido
 */
function isFieldAllowed(field, allowedFields = []) {
    return allowedFields.length === 0 || allowedFields.includes(field);
}

module.exports = {
    buildWhereClause,
    buildOrderClause,
    buildPaginationClause,
    buildSelectQuery,
    buildCountQuery,
    buildInsertQuery,
    buildUpdateQuery,
    buildDeleteQuery,
    buildJoinQuery,
    sanitizeString,
    isFieldAllowed
}; 
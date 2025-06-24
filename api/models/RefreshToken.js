const pool = require("../config/db");
const crypto = require("crypto");

class RefreshToken {
    static async create(userId, expiresIn = 7 * 24 * 60 * 60 * 1000) { // 7 days default
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date(Date.now() + expiresIn);
        
        const [result] = await pool.execute(
            "INSERT INTO refresh_tokens (id_utilizador, token, expires_at) VALUES (?, ?, ?)",
            [userId, token, expiresAt]
        );
        
        return {
            id: result.insertId,
            token,
            expires_at: expiresAt
        };
    }

    static async findByToken(token) {
        const [rows] = await pool.execute(
            "SELECT * FROM refresh_tokens WHERE token = ? AND revoked = 0 AND expires_at > NOW()",
            [token]
        );
        return rows[0];
    }

    static async revokeToken(token) {
        const [result] = await pool.execute(
            "UPDATE refresh_tokens SET revoked = 1 WHERE token = ?",
            [token]
        );
        return result.affectedRows;
    }

    static async revokeAllUserTokens(userId) {
        const [result] = await pool.execute(
            "UPDATE refresh_tokens SET revoked = 1 WHERE id_utilizador = ?",
            [userId]
        );
        return result.affectedRows;
    }

    static async cleanupExpiredTokens() {
        const [result] = await pool.execute(
            "DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = 1"
        );
        return result.affectedRows;
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute(
            "SELECT * FROM refresh_tokens WHERE id_utilizador = ? AND revoked = 0 AND expires_at > NOW()",
            [userId]
        );
        return rows;
    }
}

module.exports = RefreshToken;
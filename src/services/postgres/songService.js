const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exception/InvariantError');
const NotFoundError = require('../../exception/notFoundError');
const { mapDBToModelSongs } = require('../../utils');

class SongsService {
    constructor() {
        this._pool = new Pool();
    }
    async addSong({
        title, year, genre, performer, duration, albumId,
      }) {
        const id = nanoid(16);
        const query = {
          text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
          values: [id, title, year, genre, performer, duration, albumId],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows[0].id) {
          throw new InvariantError('Gagal Menambah Lagu');
        }
    
        return result.rows[0].id;
    }
    async getSongs() {
      try {
        const query = 'SELECT id, title, performer FROM songs';
        const result = await this._pool.query(query);
        return result.rows.map(mapDBToModelSongs);
      } catch (error) {
        console.error('Error fetching songs:', error.message);
        throw error;
      }
    }
    async getSongById(id) {
      const query = {
        text: 'SELECT * FROM songs WHERE id=$1',
        values: [id],
      };
    
      const result = await this._pool.query(query);
    
      if (!result.rows.length) {
        throw new NotFoundError('Lagu tidak ditemukan.');
      }
    
      return mapDBToModelSongs(result.rows[0]); 
    } 
    
    async editSongById(id, {
        title, year, genre, performer, duration, albumId,
      }) {
        const query = {
          text: 'UPDATE songs SET title=$1, year =$2, genre=$3, performer=$4, duration=$5, album_id=$6 WHERE id=$7 RETURNING id',
          values: [title, year, genre, performer, duration, albumId, id],
        };
    
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
          throw new NotFoundError('Gagal Edit Lagu');
        }
    }
    async deleteSongById(id) {
        const query = {
          text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
          values: [id],
        };
        const result = await this._pool.query(query);
    
        if (!result.rows.length) {
          throw new NotFoundError('lagu gagal dihapus');
        }
    }
}
module.exports = SongsService;
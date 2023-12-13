const autoBind = require('auto-bind');
const InvariantError = require('../../exception/InvariantError');
class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const albumId = id;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);

    const hasLiked = await this._service.checkLikeStatus(credentialId, albumId);
    if (hasLiked) {
        throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.');
  }
      const likeId = await this._service.addAlbumLike(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: ` like Diberikan pada album dengan id: ${likeId}`,
      });
      response.code(201);
      return response;
  }

  async deleteAlbumLikeHandler(request, h) {
    const { id } = request.params;
    const albumId = id;
    const { id: credentialId } = request.auth.credentials;

    await this._albumsService.getAlbumById(albumId);

    const hasLiked = await this._service.checkLikeStatus(credentialId, albumId);

    if (hasLiked) {
        await this._service.deleteAlbumLike(credentialId, albumId);

        const response = h.response({
            status: 'success',
            message: 'Batal Menyukaai Album',
        });
        response.code(200);
        return response;
    }
  }

  async getAlbumLikesHandler(request, h) {
    const { id } = request.params;
    const albumId = id;

    const data = await this._service.getLikesCount(albumId);
    const likes = data.count;

    const response = h.response({
      status: 'success',
      data: {
        likes,
      },
    });
    response.header('X-Data-Source', data.source);
    response.code(200);
    return response;
  }
}

module.exports = AlbumLikesHandler;
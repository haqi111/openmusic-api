const autoBind = require('auto-bind');
class UploadsHandler {
  constructor(service, validator, albumsService) {
    this._service = service;
    this._validator = validator;
    this._albumsService = albumsService;

    autoBind(this);
  }

  async postAlbumsCoversHandler(request, h) {
    const { cover } = request.payload;
    const { id } = request.params;
    this._validator.validateImageHeader(cover.hapi.headers);

    const filename = await this._service.writeFile(cover, cover.hapi);
    const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._albumsService.addCoverAlbumById(id, coverUrl);

    const response = h.response({
      status: 'success',
      message: 'Sampul berhasil Dibuat',
      data: {
        coverUrl,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
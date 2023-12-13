require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

// client error
const ClientError = require('./exception/clientError');

// songs services
const songs = require('./api/songs');
const SongsService = require('./services/postgres/songService');
const SongsValidator = require('./validator/songs');

// albums services
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumService');
const AlbumsValidator = require('./validator/albums');

// users services
const users = require('./api/users');
const UsersService = require('./services/postgres/usersService');
const UsersValidator = require('./validator/users');

// authentications services
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/authenticationsService');
const TokenManager = require('./tokenize/tokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// playlists services
const playlists = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistsValidator = require('./validator/playlists');

// exports services
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// uploads Service
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/storageService');
const UploadsValidator = require('./validator/upload');

// albums Likes
const albumLikes = require('./api/albumlikes');
const AlbumsLikesService = require('./services/postgres/albumLikesService');

// Cache Services
const CacheService = require('./services/redis/cacheService');

const init = async () =>{
    const cacheService = new CacheService();  
    const songsService = new SongsService();
    const albumsService = new AlbumsService();
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const playlistsService = new PlaylistsService();
    const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
    const albumLikesService = new AlbumsLikesService(cacheService);
    
    
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
          cors: {
            origin: ['*'],
          },
        },
    });
  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // strategy autentikasi jwt
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },

    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

await server.register([
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    }, 
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumsService,
      },
    },
    {
      plugin: albumLikes,
      options: {
        service: albumLikesService,
        albumsService,
      },
    },
  ]);
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (response instanceof Error) {
      // Handling ClientError
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
    }
    return h.continue;
  });
  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};
init();
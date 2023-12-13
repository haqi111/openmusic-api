const InvariantError = require('../../exception/InvariantError');
const ImageHeadersSchema = require('./schema');

const UploadsValidator = {
  validateImageHeader: (headers) => {
    const validationResult = ImageHeadersSchema.validate(headers);

    if (validationResult.error) {
      throw new InvariantError(validationResult);
    }
  },
};

module.exports = UploadsValidator;
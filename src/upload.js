module.exports = function (request) {
  return function (blob) {
    return request(upload({
      command: 'INIT',
      total_bytes: blob.size,
      media_type: mimeType
    }))
    .then(function(results) {
      var media_id = results.media_id_string

      return Promise.all(splitBlob(blob, blobSize).map((chunk, index) => {
        return request(upload({
          command: 'APPEND',
          media_id: media_id,
          segment_index: index,
          media: chunk
        }))
      }))
      .then(function () {
        return request(upload({
          command: 'FINALIZE',
          media_id: media_id
        }))
      })
    })
  }
}

function upload(parameters) {
  return {
    endpoint: 'media/upload.json',
    domain: 'upload.twitter.com',
    method: 'POST',
    parameterType: 'form',
    parameters: parameters    
  }
}
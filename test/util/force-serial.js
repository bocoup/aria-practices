'use strict';
const net = require('net');

function bindPort (port) {
  const server = net.createServer();
  const release = () => {
    return new Promise((resolve, reject) => {
      server.close((err) => err ? reject(err) : resolve());
    });
  };

  return new Promise((resolve) => {
    server.listen(port, () => resolve(release));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      }
      else {
        reject(err);
      }
    });
  });
}

/**
 * Exceute an asynchronous operation in isolation of any similarly-scheduled
 * operations across processes.
 *
 * @param {Number} port - TCP/IP port to use as a resource lock
 * @param {Function} safe - function that will be executed in isolation
 *
 * @returns {Promise} eventual value which shares the resolution of the
 *                    provided operation
 */
module.exports = function forceSerial (t, port, safe) {
  t.log('port in forceSerial: ' + port);
  return bindPort(port)
    .then((release) => {
      if (!release) {
        return new Promise((resolve) => setTimeout(resolve, 300))
          .then(() => forceSerial(t, port, safe));
      }
      const operation = new Promise((resolve) => resolve(safe()));

      return operation
        .then(release, release)
        .then(() => operation);
    });
};

'use strict';

const assert = require('assert');
const { path: binaryPath } = require('geckodriver');
const { spawn } = require('child_process');

const getJSON = require('./get-json');
const forceSerial = require('./force-serial');
const SERIES_LOCK = 8432;

class Now {
  constructor (time) {
    Object.defineProperty(this, 'time', {
      enumerable: true,
      configurable: false,
      writable: false,
      value: process.hrtime(time)
    });
  }

  get nano () {
    const { time: [sec, nano] } = this;
    return sec * 1e9 + nano;
  }

  get seconds () {
    return this.toNano() / 1e9;
  }
}

const startOnPort = (port, timeout) => {
  if (timeout < 0) {
    return Promise.reject(new Error(
      'Timed out while locating free port for WebDriver server'
    ));
  }

  const start = new Now();
  const child = spawn(binaryPath, ['--port', port]);

  return new Promise((resolve, reject) => {
    let stopPolling = false;
    const giveUp = () => {
      stopPolling = true;
      resolve(null);
    };

    child.on('close', giveUp);

    (function poll () {
      if (stopPolling) {
        return;
      }

      if (timeout - (new Now(start).seconds) < 0) {
        reject(new Error('Timed out while waiting for WebDriver server'));
        return;
      }

      getJSON('http://localhost:' + port + '/status')
        .then((data) => {
          assert(data.value.ready);

          child.removeListener('close', giveUp);
          resolve(() => child.kill());
        })
        .catch(() => setTimeout(poll, 500));
    }());
  });
};

const startOnAnyPort = (port, timeout) => {
  const start = new Now();

  return startOnPort(port, timeout)
    .then(function (stop) {
      if (!stop) {
        return startOnAnyPort(port + 1, timeout - (new Now(start).seconds));
      }
      return { stop, port };
    });
};

/**
 * Start a GeckoDriver server using a dynamically-determined available TCP/IP
 * port.
 *
 * @param {Number} port - the TCP/IP port from which to begin search
 * @param {Number} timeout - the number of milliseconds to attempt to create a
 *                           server before reporting a failure
 *
 * @returns {Promise<Object>} - an eventual value for interfacing with the
 *                               server. The `port` property is the numeric
 *                               TCP/IP port to which the server is bound. The
 *                               `stop` property is a function for destroying
 *                               the server.
 */
module.exports = (port, timeout) => {
  return forceSerial(SERIES_LOCK, () => startOnAnyPort(port, timeout));
};

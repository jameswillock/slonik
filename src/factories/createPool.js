// @flow

import pg from 'pg';
import serializeError from 'serialize-error';
import {
  parse as parseConnectionString
} from 'pg-connection-string';
import {
  createUlid,
  formatNotice
} from '../utilities';
import type {
  ClientUserConfigurationType,
  DatabasePoolType,
  DatabaseConfigurationType
} from '../types';
import Logger from '../Logger';
import bindPool from '../binders/bindPool';
import createClientConfiguration from './createClientConfiguration';

export default (
  connectionConfiguration: DatabaseConfigurationType,
  clientUserConfiguration?: ClientUserConfigurationType
): DatabasePoolType => {
  const clientConfiguration = createClientConfiguration(clientUserConfiguration);

  const poolLog = Logger.child({
    poolId: createUlid()
  });

  const pool = new pg.Pool(typeof connectionConfiguration === 'string' ? parseConnectionString(connectionConfiguration) : connectionConfiguration);

  pool.on('error', (error) => {
    poolLog.error({
      error: serializeError(error)
    }, 'client connection error');
  });

  pool.on('connect', (client) => {
    client.connection.slonik = {
      connectionId: createUlid()
    };

    client.on('notice', (notice) => {
      poolLog.info({
        notice: formatNotice(notice)
      }, 'notice message');
    });

    poolLog.info({
      processId: client.processID,
      stats: {
        idleConnectionCount: pool.idleCount,
        totalConnectionCount: pool.totalCount,
        waitingRequestCount: pool.waitingCount
      }
    }, 'created a new client connection');
  });

  pool.on('acquire', (client) => {
    poolLog.info({
      processId: client.processID,
      stats: {
        idleConnectionCount: pool.idleCount,
        totalConnectionCount: pool.totalCount,
        waitingRequestCount: pool.waitingCount
      }
    }, 'client is checked out from the pool');
  });

  pool.on('remove', (client) => {
    poolLog.info({
      processId: client.processID,
      stats: {
        idleConnectionCount: pool.idleCount,
        totalConnectionCount: pool.totalCount,
        waitingRequestCount: pool.waitingCount
      }
    }, 'client connection is closed and removed from the client pool');
  });

  return bindPool(poolLog, pool, clientConfiguration);
};

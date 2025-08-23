import { InfluxDB, Point } from '@influxdata/influxdb-client';
import 'dotenv/config';
import influxDB from '../config/influxdbClient.js';

const org = process.env.INFLUXDB_ORG;
const bucket = process.env.INFLUXDB_BUCKET;

const writeApi = influxDB.getWriteApi(org, bucket);
const queryApi = influxDB.getQueryApi(org);

export const addShoe = async (size, color, quantity) => {
  const point = new Point('shoes')
    .tag('size', size)
    .tag('color', color)
    .intField('quantity', quantity)
    .timestamp(new Date());

  writeApi.writePoint(point);
  await writeApi.flush();
};

export const getShoes = async (filters) => {
  let fluxQuery = `from(bucket: "${bucket}")
    |> range(start: -30d)
    |> filter(fn: (r) => r._measurement == "shoes")`;

  if (filters.size) {
    fluxQuery += ` |> filter(fn: (r) => r.size == "${filters.size}")`;
  }

  if (filters.color) {
    fluxQuery += ` |> filter(fn: (r) => r.color == "${filters.color}")`;
  }

  fluxQuery += `
    |> last()
    |> filter(fn: (r) => r._value > 0)`;

  const results = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        const o = tableMeta.toObject(row);
        results.push(o);
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};

export const sellShoe = async (size, color) => {
    const point = new Point('shoes')
        .tag('size', size)
        .tag('color', color)
        .intField('quantity', 0)
        .timestamp(new Date());

    writeApi.writePoint(point);
    await writeApi.flush();
};

export const close = async () => {
    await writeApi.close();
};

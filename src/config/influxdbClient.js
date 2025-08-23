import { InfluxDB } from '@influxdata/influxdb-client';
import 'dotenv/config';

const url = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;

const influxDB = new InfluxDB({ url, token });

export default influxDB;

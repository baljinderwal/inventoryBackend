import { InfluxDBClient } from '@influxdata/influxdb3-client'
import 'dotenv/config'

const influxDB = new InfluxDBClient({
  host: process.env.INFLUXDB_URL,
  token: process.env.INFLUXDB_TOKEN,
})

export default influxDB

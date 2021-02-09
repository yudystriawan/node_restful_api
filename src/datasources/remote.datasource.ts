import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'remote',
  connector: 'mongodb',
  url: 'mongodb+srv://dbUser:password1234@restful.tp8d8.mongodb.net/dbUser?retryWrites=true&w=majority',
  host: '',
  port: 0,
  user: '',
  password: '',
  database: '',
  useNewUrlParser: true
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class RemoteDataSource extends juggler.DataSource
  implements LifeCycleObserver {
  static dataSourceName = 'remote';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.remote', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

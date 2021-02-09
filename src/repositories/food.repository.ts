import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {RemoteDataSource} from '../datasources';
import {Food, FoodRelations} from '../models';

export class FoodRepository extends DefaultCrudRepository<
  Food,
  typeof Food.prototype.id,
  FoodRelations
> {
  constructor(@inject('datasources.remote') dataSource: RemoteDataSource) {
    super(Food, dataSource);
  }
}

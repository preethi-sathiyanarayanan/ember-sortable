import Controller from '@ember/controller';
import { defer } from 'rsvp';
import { action } from '@ember/object';

export default class ApplicationController extends Controller {
  
  @action
  test() {
    let deferred = defer();

    // setTimeout(() => {
    //   deferred.reject(true);
    // }, 3000);

    return deferred.promise;
  }
}

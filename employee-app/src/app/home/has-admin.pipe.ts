import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasAdmin'
})
export class HasAdminPipe implements PipeTransform {

  transform(value: String[], ...args: unknown[]): boolean {
    if(!value){
      return false;
    }
    const indx = value.findIndex(e => e.endsWith('ADMIN'));
    return indx > -1;
  }

}

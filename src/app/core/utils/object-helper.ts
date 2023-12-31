export class ObjectHelper {
  cloneDeepSimple<T>(obj: T): T {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }
    let newObj: any = {};
    if (Array.isArray(obj)) {
      newObj = obj.map(item => this.cloneDeepSimple(item));
    } else if ((<any>obj).getMonth && obj instanceof Date) {
      newObj = new Date(obj.getTime());
    } else {
      Object.keys(obj).forEach((key) => {
        return newObj[key] = this.cloneDeepSimple((<any>obj)[key]);
      })
    }
    return <T>newObj;
  }
}

export const objectHelper = new ObjectHelper();

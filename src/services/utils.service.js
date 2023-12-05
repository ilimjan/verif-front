class ObjectUtils {
  copyObject(object) {
    return JSON.parse(JSON.stringify(object));
  }
}

export const $ObjectUtils = new ObjectUtils();

class MathUtils {
  randomInt(min, max) {
    return min + Math.floor((max - min) * Math.random());
  }
}

export const $MathUtils = new MathUtils();

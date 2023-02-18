import { Rating } from '../shared/services/api';

export class RatingStatistic {
  public get min() {
    if (this.ratings.length == 0) {
      return '-';
    }

    const min = this.ratings.reduce((a, b) => a <= b.value ? a : b.value, 999);
    return min != null ? min : '-';
  }

  public get mean() {
    if (this.ratings.length == 0) {
      return '-';
    }

    return (this.ratings.reduce((a, c) => a + c.value, 0) / this.ratings.length).toFixed(1);
  }

  public get median() {
    if (this.ratings.length == 0) {
      return '-';
    }

    let array = this.ratings.map(r => r.value);
    array = array.sort();

    if (array.length % 2 === 0) {
      return (array[array.length / 2] + array[(array.length / 2) - 1]) / 2;
    } else {
      return array[(array.length - 1) / 2];
    }
  }

  public get max() {
    if (this.ratings.length == 0) {
      return '-';
    }

    const max = this.ratings.reduce((a, b) => a >= b.value ? a : b.value, 1);
    return max != null ? max : '-';
  }

  public get count() {
    return this.ratings.length;
  }

  constructor(public ratings: Rating[] = []) { }
}

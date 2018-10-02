import { Rating } from './rating';
import * as _ from 'lodash';

export class RatingStatistic {
    public get min() {
        const min = _.minBy(this.ratings, r => r.value);
        return min != null ? min.value : '-';
    }

    public get mean() {
        if (this.ratings.length <= 0) {
            return '-';
        }

        return _.meanBy(this.ratings, r => r.value).toFixed(1);
    }

    public get median() {
        let array = _.map(this.ratings, r => r.value);
        array = array.sort();

        if (this.ratings.length <= 0) {
            return '-';
        }

        if (array.length % 2 === 0) {
          return (array[array.length / 2] + array[(array.length / 2) - 1]) / 2;
        } else {
          return array[(array.length - 1) / 2];
        }
    }

    public get max() {
        const max = _.maxBy(this.ratings, r => r.value);
        return max != null ? max.value : '-';
    }

    public get count() {
        return this.ratings.length;
    }

    constructor(public ratings: Rating[] = []) {}
}

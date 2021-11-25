export class Paginated<T> {
  totalPages!: number;
  totalResults!: number;
  page!: number;
  results!: T[];

  constructor() {
    this.totalPages = 0;
    this.totalResults = 0;
    this.page = 0;
    this.results = [];
  }
}

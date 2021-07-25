export class Ingredient {
  public name: string;
  public amount: number;
  public unit: string;
  constructor(name: string, amount: number, unit: string) {
    this.name = name;
    this.amount = amount;
    this.unit = unit;
  }
}

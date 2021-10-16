export class Ingredient {
  public name: string;
  public amount: number;
  public unit: string;
  public text: string;
  constructor(name: string, amount: number, unit: string, text?: string) {
    this.name = name;
    this.amount = amount;
    this.unit = unit;
    this.text = text;
  }
}

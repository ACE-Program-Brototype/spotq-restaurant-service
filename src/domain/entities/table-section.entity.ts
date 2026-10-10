import { RestaurantIdRequiredError } from "@domain/errors/restaurant.errors";
import { InvalidTableSectionNameError } from "@domain/errors/table-section.errors";

export interface TableSectionPropsType {
  id: string;
  restaurantId: string;
  sectionName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTableSectionPropsType {
  id?: string;
  restaurantId: string;
  name: string;
}

export class TableSection {
  private constructor(private readonly props: TableSectionPropsType) {}


  /**
   * Create Table Section Instance
   * @param props name and restaurantId
   * @returns TableSection
   */
  public static create(props: CreateTableSectionPropsType) : TableSection {
    const sectionName = props.name.trim();
    const restaurantId = props.restaurantId.trim();

    // if sectionName is invalid throws errror
    if (
      !sectionName ||
      typeof sectionName !== "string" ||
      sectionName.length < 2
    ) {
      throw new InvalidTableSectionNameError();
    }

    // if restaurantId is invalid throws error
    if (!restaurantId || typeof restaurantId !== "string") {
      throw new RestaurantIdRequiredError();
    }

    // generates Id
    const id = props.id || crypto.randomUUID();


    const now = new Date();
    return new TableSection({
      id,
      sectionName,
      restaurantId,
      createdAt: now,
      updatedAt: now,
    });
  }

  get id(){
    return this.props.id
  }

  get sectionName(){
    return this.props.sectionName
  }

  get restaurantId(){
    return this.props.restaurantId
  }

  get createdAt(){
    return this.props.createdAt
  }

  get updatedAt(){
    return this.props.updatedAt
  }
}

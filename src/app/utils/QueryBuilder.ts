import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaWhereConditions, PrismsaStringFilter } from "../interfaces/query.interface";

// T = Model Name and TWhereInput = Where Input Type for the Model
export class QueryBuilder<T, TWhereInput = Record<string, unknown>, TInclude = Record<string, unknown>> {
    private query: PrismaFindManyArgs;
    private countQuery: PrismaCountArgs;
    private page: number = 1;
    private limit: number = 10;
    private skip: number = 0;
    private sortBy: string = "createdAt";
    private sortOrder: "asc" | "desc" = "desc";
    private selectFields: Record<string, boolean | undefined>;

    constructor(
        private model: PrismaModelDelegate,
        private queryParams: IQueryParams,
        private config: IQueryConfig
    ) {
        this.query = {
            where: {},
            include: {},
            orderBy: {},
            select: {},
            skip: 0,
            take: 10,
        };

        this.countQuery = {
            where: {},
        }
    }

    search(): this {
        const { searchTerm } = this.queryParams;
        const { searchableFields } = this.config;
        // doctorSearchableFields = ["gender", "user.name", "user.email", "user.phoneNumber", "user.address, "specialities.speciality.title", "specialities.speciality.description"];
        if (searchTerm && searchableFields.length > 0) {
            const searchConditions: Record<string, unknown>[] =
                searchableFields.map(field => {
                    if (field.includes(".")) {
                        const parts = field.split(".");
                        if (parts.length === 2) {
                            const [relation, nestedField] = parts;
                            const stringFilter: PrismsaStringFilter = {
                                contains: searchTerm,
                                mode: "insensitive",
                            }

                            return {
                                [relation]: {
                                    [nestedField]: stringFilter,
                                }
                            }
                        }
                        else if (parts.length === 3) {
                            const [relation, nestedRelation, nestedField] = parts;

                            const stringFilter: PrismsaStringFilter = {
                                contains: searchTerm,
                                mode: "insensitive",
                            };

                            return {
                                [relation]: {
                                    [nestedRelation]: {
                                        [nestedField]: stringFilter,
                                    }
                                }
                            }
                        }
                    }

                    const stringFilter: PrismsaStringFilter = {
                        contains: searchTerm,
                        mode: "insensitive",
                    };

                    return {
                        [field]: stringFilter,
                    };
                });


            const whereConditions = this.query.where as PrismaWhereConditions;
            whereConditions.OR = searchConditions;

            const countwhereConditions = this.countQuery.where as PrismaWhereConditions;
            countwhereConditions.OR = searchConditions;
        }

        return this;
    }

    filter(): this {
        

        return this;
    }
}
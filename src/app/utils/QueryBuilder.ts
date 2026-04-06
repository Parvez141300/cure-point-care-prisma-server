import { IQueryConfig, IQueryParams, PrismaCountArgs, PrismaFindManyArgs, PrismaModelDelegate, PrismaNumberFilter, PrismaWhereConditions, PrismsaStringFilter } from "../interfaces/query.interface";

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

    // doctors?searchTerm=cardi&page=1&limit=10&sortBy=createdAt&sortOrder=desc&fields=name,email,phoneNumber&includes=user&appointmentFee[lt] = 100 => 
    // => {speciality: "Cardiology", appointmentFee: {lt: 100, gt: 50}}
    filter(): this {
        const { filterableFields } = this.config;
        const excludedField = ["searchTerm", "page", "limit", "sortBy", "sortOrder", "fields", "includes"];
        const filterParams: Record<string, unknown> = {};
        Object.keys(this.queryParams).forEach(key => {
            if (!excludedField.includes(key)) {
                filterParams[key] = this.queryParams[key];
            }
        });

        const queryWhere = this.query.where as Record<string, unknown>;
        const countQueryWhere = this.countQuery.where as Record<string, unknown>;

        Object.keys(filterParams).forEach(key => {
            const value = filterParams[key]; 
            if (value === undefined && value === null) {
                return;
            };
            const isAllowedField = !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);

            if (!isAllowedField) {
                return;
            }

            // doctorFilterableFields = ['specialities.speciality.title', 'appointmentFee', 'experience'];
            // doctors?user.name=john => {user: {name: "john"}}
            // doctors?appointmentFee[lt]=100&appointmentFee[gt]=50&experience[lte]=10&experience[gte]=5 => {appointmentFee: {lt: 100, gt: 50}, experience: {lte: 10, gte: 5}}
            if (key.includes(".")) {
                const parts = key.split("."); // ["user", "name"] or ["specialities", "speciality", "title"]

                if (filterableFields && !filterableFields.includes(key)) {
                    return;
                }

                if (parts.length === 2) {
                    const [relation, nestedField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    queryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value),
                    };

                    countQueryWhere[relation] = {
                        [nestedField]: this.parseFilterValue(value),
                    };
                    return;
                }
                else if (parts.length === 3) {
                    const [relation, nestedRelation, nestedField] = parts;

                    if (!queryWhere[relation]) {
                        queryWhere[relation] = {};
                        countQueryWhere[relation] = {};
                    }

                    queryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value),
                        }
                    };

                    countQueryWhere[relation] = {
                        [nestedRelation]: {
                            [nestedField]: this.parseFilterValue(value),
                        }
                    };
                    return;
                }
                else {
                    queryWhere[key] = this.parseFilterValue(value);
                    countQueryWhere[key] = this.parseFilterValue(value);
                    return;
                }
            }

            // {lt: "100", gt: "50"}
            // range filter parsing
            if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                queryWhere[key] = this.parseFilterRange(value as Record<string, string | number>);
                countQueryWhere[key] = this.parseFilterRange(value as Record<string, string | number>);
                return;
            }
            // not nesting direct value parsing
            queryWhere[key] = this.parseFilterValue(value);
            countQueryWhere[key] = this.parseFilterValue(value);
        });

        return this;
    }

    private parseFilterValue(value: unknown): unknown {
        if (value === "true") {
            return true;
        }
        if (value === "false") {
            return false;
        }
        if (typeof value === "string" && !isNaN(Number(value)) && value !== "") {
            return Number(value);
        }
        if (Array.isArray(value)) {
            return value.map(item => this.parseFilterValue(item));
        }

        return value;
    }

    private parseFilterRange(value: Record<string, number | unknown>): PrismaNumberFilter | PrismsaStringFilter | Record<string, unknown> {
        const rangeQuery: Record<string, string | number | (string | number)[]> = {};

        Object.keys(value).forEach((operator) => {
            const operatorValue = value[operator];

            const parsedValue: string | number = typeof operatorValue === "string" && !isNaN(Number(operatorValue)) ? Number(operatorValue) : (operatorValue as string | number);

            switch (operator) {
                case "lt":
                    rangeQuery.lt = parsedValue;
                    break;
                case "lte":
                    rangeQuery.lte = parsedValue;
                    break;
                case "gt":
                    rangeQuery.gt = parsedValue;
                    break;
                case "gte":
                    rangeQuery.gte = parsedValue;
                    break;
                case "equals":
                    rangeQuery.equals = parsedValue;
                    break;
                case "not":
                    rangeQuery.not = parsedValue;
                    break;
                case "startsWith":
                    rangeQuery.startsWith = parsedValue;
                    break;
                case "endsWith":
                    rangeQuery.endsWith = parsedValue;
                    break;
                case "in":
                case "notIn":
                    if (Array.isArray(parsedValue)) {
                        rangeQuery[operator] = parsedValue;
                    }
                    else {
                        rangeQuery[operator] = [parsedValue];
                    }
                    break;
                default:
                    break;
            }
        });

        return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
    }
}
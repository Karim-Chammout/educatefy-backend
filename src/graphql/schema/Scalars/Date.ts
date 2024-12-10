import { GraphQLScalarType, Kind } from 'graphql';

const DateScalar = new GraphQLScalarType({
  name: 'Date',
  description: 'Date custom scalar type',
  serialize(value) {
    if (!(value instanceof Date)) {
      throw new Error('Serial value must be an instance of Date');
    }

    return value.toISOString();
  },
  parseValue(value) {
    if (typeof value !== 'string') {
      throw new Error('Invalid value type for Date scalar');
    }

    const parsedDate = new Date(value);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date string');
    }

    return parsedDate;
  },
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new Error('Invalid value type for Date scalar');
    }

    const parsedDate = new Date(ast.value);

    if (isNaN(parsedDate.getTime())) {
      throw new Error('Invalid date string');
    }

    return parsedDate;
  },
});

export default DateScalar;

const pluralize = dust => {
  dust.filters.pluralize = (number, string) => {
    return (number > 1 ? string + 's' : string);
  }
}

module.exports = pluralize;

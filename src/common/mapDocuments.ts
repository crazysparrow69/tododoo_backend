export const mapDocuments = <TInput, TOutput>(
  items: TInput[],
  mapper: (item: TInput) => TOutput
): TOutput[] => {
  return items.map(mapper);
};

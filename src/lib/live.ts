export type LiveFigure = {
  value: string;
  label: string;
  asOf: string;
  source: string;
};

export type Today = {
  fetchedAt: string;
  vienna: string;
  euroDollar: LiveFigure | null;
  power: LiveFigure | null;
};

export type Fact = {
  value: string;
  label: string;
};

export type Brief = {
  title: string | null;
  answer: string;
  facts: Fact[];
  source: string | null;
  code: string | null;
};
